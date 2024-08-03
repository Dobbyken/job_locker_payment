import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/api.service';
import { User } from '../../schema/user.schema';
import { Role } from 'src/middleware/auth/role.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly userService: UserService) {}

  /**
   * Validate and register the user if they do not exist
   * @param user - The user object from Google profile
   * @returns The authenticated user
   */
  async validateUser(user: any): Promise<User> {
    this.logger.log(`Validating user: ${user.email}`);
    const existingUser = await this.userService.findByEmail(user.email);
    if (existingUser) {
      this.logger.log(`User found: ${user.email}`);
      return existingUser;
    }
    this.logger.log(`Registering new user: ${user.email}`);
    const newUser = {
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: null,
      account: user.sub,
      verified: true,
      status: true,
      role: Role.PUBLIC,
    };
    try {
      return await this.userService.register(newUser);
    } catch (error) {
      this.logger.error(`Failed to register user: ${error.message}`);
      throw error;
    }
  }
}
