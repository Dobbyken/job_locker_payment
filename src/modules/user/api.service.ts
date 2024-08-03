import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   * @param createUserDto - Data Transfer Object containing user details
   * @returns The created user
   */
  async register(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Registering user: ${JSON.stringify(createUserDto)}`);
    try {
      let hashedPassword;
      if (createUserDto.password) {
        hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      }
      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpiry = new Date(Date.now() + 15 * 60000); // 15 minutes

      createUserDto.account = createUserDto.email;

      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        otp,
        otpExpiry,
        verified: false,
      });

      await this.sendOtpEmail(newUser.email, otp);

      const user = await newUser.save();

      this.logger.log(`User registered with email: ${user.email}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to register user: ${error.message}`);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  /**
   * Send OTP via email
   * @param email - User email
   * @param otp - OTP code
   */
  async sendOtpEmail(email: string, otp: number): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'Outlook365',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      // from: "Useitpro",
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It is valid for 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    this.logger.log(`OTP sent to email: ${email}`);
  }

  /**
   * Verify OTP for a user
   * @param verifyOtpDto - Data Transfer Object containing OTP details
   * @returns The verified user
   */
  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<User> {
    this.logger.log(`Verifying OTP for email: ${verifyOtpDto.email}`);
    try {
      const user = await this.userModel.findOne({ email: verifyOtpDto.email });
      if (
        !user ||
        user.otp.toString() !== verifyOtpDto.otp.toString() ||
        user.otpExpiry < new Date()
      ) {
        throw new BadRequestException('Invalid OTP');
      }
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.verified = true;
      this.logger.log(`User verified with email: ${user.email}`);
      return user.save();
    } catch (error) {
      this.logger.error(`Failed to verify OTP: ${error.message}`);
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

  /**
   * Log in a user
   * @param signInDto - Data Transfer Object containing login details
   * @returns An access token
   */
  async login(signInDto: SignInDto): Promise<{
    user: Partial<User>;
    access_token: string;
    refresh_token: string;
  }> {
    this.logger.log(`Logging in user with email: ${signInDto.email}`);
    try {
      const user = await this.userModel
        .findOne({
          email: signInDto.email,
          verified: true,
          permission: true,
          status: true,
        })
        .select('+password')
        .lean();
      if (!user) {
        this.logger.error(`User not found with email: ${signInDto.email}`);
        throw new BadRequestException('Invalid email or password');
      }

      if (user.password) {
        if (!signInDto.password) {
          this.logger.error(
            `Password is required for email: ${signInDto.email}`,
          );
          throw new BadRequestException('Password is required');
        }

        if (!(await bcrypt.compare(signInDto.password, user.password))) {
          this.logger.error(`Invalid password for email: ${signInDto.email}`);
          throw new BadRequestException('Invalid email or password');
        }
      }

      const payload = { username: user.name, sub: user.id, roles: user.role };

      // Generate access and refresh tokens
      const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refresh_token = this.jwtService.sign(payload, { expiresIn: '3d' });

      // Remove the password field from the user object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        access_token,
        refresh_token,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to login user: ${error.message}`);
      throw new InternalServerErrorException('Failed to login user');
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshTokenDto - Data Transfer Object containing refresh token
   * @returns A new access token
   */
  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ access_token: string }> {
    this.logger.log(`Refreshing access token`);
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refresh_token);
      const access_token = this.jwtService.sign(
        { username: payload.username, sub: payload.sub, roles: payload.roles },
        { expiresIn: '15m' },
      );

      return { access_token };
    } catch (error) {
      this.logger.error(`Failed to refresh access token: ${error.message}`);
      throw new InternalServerErrorException('Failed to refresh access token');
    }
  }

  /**
   * Get a user by ID
   * @param id - User ID
   * @returns The user
   */
  async findOne(id: string): Promise<User> {
    this.logger.log(`Fetching user with ID: ${id}`);
    try {
      const user = await this.userModel.findOne({ id }).exec();
      if (!user || !user.status) {
        throw new NotFoundException('User not found or inactive');
      }
      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  /**
   * Get users by IDs
   * @param ids - Array of user IDs
   * @returns The users
   */
  async findByIds(ids: string[]): Promise<User[]> {
    this.logger.log(`Fetching users with IDs: ${ids}`);
    try {
      return await this.userModel.find({ id: { $in: ids } }).exec();
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  /**
   * Get users by Email
   * @param email - User email
   * @returns The users
   */
  async findByEmail(email: string): Promise<User> {
    this.logger.log(`Fetching user with email: ${email}`);
    try {
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      this.logger.error(`Failed to fetch user: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  /**
   * Get all users
   * @returns The users
   */
  async findAll(): Promise<User[]> {
    this.logger.log('Fetching all users');
    try {
      return await this.userModel.find({ status: true }).exec();
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  /**
   * Update a user by ID
   * @param id - User ID
   * @param updateUserDto - Data Transfer Object containing updated user details
   * @returns The updated user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(
      `Updating user with ID: ${id} with details: ${JSON.stringify(updateUserDto)}`,
    );
    try {
      // Remove Restricted Data
      delete updateUserDto.email;
      delete updateUserDto.role;
      delete updateUserDto.id;
      delete updateUserDto._id;
      delete updateUserDto.status;
      delete updateUserDto.permission;
      delete (updateUserDto as any).verified;
      delete (updateUserDto as any).__v;

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      const updatedUser = await this.userModel
        .findOneAndUpdate({ id: id }, updateUserDto, { new: true })
        // .findByIdAndUpdate({ id: id }, updateUserDto, { new: true })
        .exec();
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /**
   * Delete users by IDs
   * @param ids - Array of user IDs
   * @returns The result of the deletion
   */
  async remove(ids: string[]): Promise<any> {
    this.logger.log(`Deactivating users with IDs: ${ids}`);
    try {
      const result = await this.userModel
        .updateMany({ id: { $in: ids } }, { $set: { status: false } })
        .exec();
      if (result.modifiedCount === 0) {
        throw new NotFoundException('No users found to deactivate');
      }
      return result;
    } catch (error) {
      this.logger.error(`Failed to deactivate users: ${error.message}`);
      throw new InternalServerErrorException('Failed to deactivate users');
    }
  }
}
