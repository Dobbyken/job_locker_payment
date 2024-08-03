import { Controller, Get, Req, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './api.service';
import { UserService } from '../user/api.service';
import { SignInDto } from '../user/dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Initiate Google Authentication
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    this.logger.log('Initiating Google Authentication');
  }

  /**
   * Google Authentication Callback
   * @param req - The request object
   * @returns The authenticated user's payload
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    this.logger.log('Handling Google Authentication Callback');
    try {
      const user: SignInDto = {
        email: req.user.user.email,
        password: null,
      };
      const payload = await this.userService.login(user);
      this.logger.log(`User authenticated: ${user.email}`);
      return payload;
    } catch (error) {
      this.logger.error(`Failed to authenticate user: ${error.message}`);
      throw error;
    }
  }
}
