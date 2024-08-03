import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './api.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../middleware/auth/jwt-auth.guard';
import { Roles } from '../../middleware/auth/roles.decorator';
import { Role } from '../../middleware/auth/role.enum';
import { RolesGuard } from '../../middleware/auth/roles.guard';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  /**
   * Register a new user
   * @param createUserDto - Data Transfer Object containing user details
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.log(
      `Registering a new user with details: ${JSON.stringify(createUserDto)}`,
    );
    try {
      const createdUser = await this.userService.register(createUserDto);
      this.logger.log(`User registered successfully: ${createdUser.email}`);
      return { result: 'success' };
    } catch (error) {
      this.logger.error(`Failed to register user: ${error.message}`);
      throw new HttpException(
        'Failed to register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Log in a user
   * @param signInDto - Data Transfer Object containing login details
   */
  @Post('login')
  async login(@Body() signInDto: SignInDto) {
    this.logger.log(`Logging in user with email: ${signInDto.email}`);
    try {
      const result = await this.userService.login(signInDto);
      this.logger.log(`User logged in successfully: ${result.user.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to login user: ${error.message}`);
      throw new HttpException(
        'Failed to login user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Refresh access token
   * @param refreshTokenDto - Data Transfer Object containing refresh token
   */
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.log(`Refreshing access token`);
    try {
      const result = await this.userService.refresh(refreshTokenDto);
      this.logger.log(`Access token refreshed successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to refresh access token: ${error.message}`);
      throw new HttpException(
        'Failed to refresh access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify OTP for a user
   * @param verifyOtpDto - Data Transfer Object containing OTP details
   */
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    this.logger.log(`Verifying OTP for email: ${verifyOtpDto.email}`);
    try {
      const result = await this.userService.verifyOtp(verifyOtpDto);
      this.logger.log(
        `OTP verified successfully for email: ${verifyOtpDto.email}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to verify OTP: ${error.message}`);
      throw new HttpException(
        'Failed to verify OTP',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a user by ID
   * @param id - User ID
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER, Role.VIP)
  @Get('me')
  async findOne(@Req() req: any) {
    this.logger.log(`Fetching user with ID: ${req.user.userId}`);
    try {
      const user = await this.userService.findOne(req.user.userId);
      if (!user) {
        this.logger.warn(`User not found with ID: ${req.user.userId}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`User fetched successfully with ID: ${req.user.userId}`);
      return user;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      this.logger.error(`Failed to fetch user: ${error.message}`);
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all users or users by IDs
   * @param ids - Comma-separated list of user IDs
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER, Role.VIP)
  @Get()
  async findAll(@Query('ids') ids: string) {
    try {
      if (ids) {
        this.logger.log(`Fetching users with IDs: ${ids}`);
        const idArray = ids.split(',');
        const users = await this.userService.findByIds(idArray);
        this.logger.log(`Users fetched successfully with IDs: ${ids}`);
        return users;
      } else {
        this.logger.log('Fetching all users');
        const users = await this.userService.findAll();
        this.logger.log('All users fetched successfully');
        return users;
      }
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a user by ID
   * @param id - User ID
   * @param updateUserDto - Data Transfer Object containing updated user details
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER, Role.VIP)
  @Put('update/:id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(
      `Updating user with ID: ${id} with details: ${JSON.stringify(updateUserDto)}`,
    );
    try {
      const updatedUser = await this.userService.update(id, updateUserDto);
      if (!updatedUser) {
        this.logger.warn(`User not found with ID: ${id}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`User updated successfully with ID: ${id}`);
      return updatedUser;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }
      this.logger.error(`Failed to update user: ${error.message}`);
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Deactivate users by IDs
   * @param ids - Comma-separated list of user IDs
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_MASTER)
  @Delete()
  async deactivate(@Query('ids') ids: string) {
    this.logger.log(`Removing users with IDs: ${ids}`);
    try {
      const idArray = ids.split(',');
      const result = await this.userService.remove(idArray);
      this.logger.log(`Users removed successfully with IDs: ${ids}`);
      return result;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        this.logger.warn(`No users found to deactivate with IDs: ${ids}`);
        throw new HttpException(
          'No users found to remove',
          HttpStatus.NOT_FOUND,
        );
      }
      this.logger.error(`Failed to remove users: ${error.message}`);
      throw new HttpException(
        'Failed to remove users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
