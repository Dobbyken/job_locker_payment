// src/middleware/auth/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  /**
   * Checks if the request is authorized to access the route.
   * @param context - The execution context
   * @returns A boolean indicating if the request is authorized
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.logger.warn('No token provided in request headers');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      this.logger.log(
        `Token verified successfully for user: ${decoded.username}`,
      );
    } catch (err) {
      this.logger.error(`Invalid token: ${err.message}`);
      throw new UnauthorizedException('Invalid token');
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  /**
   * Extracts the JWT token from the request headers.
   * @param request - The HTTP request object
   * @returns The JWT token as a string
   */
  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }
    return authHeader.split(' ')[1];
  }
}
