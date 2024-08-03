import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './api.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  /**
   * Validate the user using Google OAuth
   * @param accessToken - The access token
   * @param refreshToken - The refresh token
   * @param profile - The Google profile
   * @param done - The callback function
   * @returns The authenticated user payload
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    this.logger.log(`Validating user profile: ${profile.id}`);
    try {
      const { name, emails } = profile;
      const user = {
        email: emails[0].value,
        name: profile.displayName,
        firstName: name.givenName,
        lastName: name.familyName,
        sub: profile.id,
      };
      const payload = {
        user,
        accessToken,
        refreshToken,
      };

      const authUser = await this.authService.validateUser(user);
      if (!authUser) {
        throw new UnauthorizedException();
      }
      this.logger.log(`User validated: ${user.email}`);
      done(null, payload);
    } catch (error) {
      this.logger.error(`Failed to validate user: ${error.message}`);
      done(error, false);
    }
  }
}
