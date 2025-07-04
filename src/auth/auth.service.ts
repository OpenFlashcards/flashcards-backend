import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '../config/config.service';
import { AuthResponseDto } from './dto';
import { JwtPayload } from './strategies';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Validate user credentials
   * @param email User email
   * @param password User password
   * @returns User object without password if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<any> {
    try {
      // Find user by email
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return null;
      }

      // Check if password matches
      const isPasswordValid = this.userService.verifyPassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        return null;
      }

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Generate JWT token for authenticated user
   * @param user User object
   * @returns Auth response with token and user info
   */
  async login(user: any): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    // Calculate expiration time in seconds
    const expiresIn = this.parseExpirationTime(this.configService.jwtExpiresIn);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Verify JWT token and extract user info
   * @param token JWT token
   * @returns User info if token is valid
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return {
        id: payload.sub,
        email: payload.email,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Parse expiration time string to seconds
   * @param expiresIn Time string (e.g., '7d', '24h', '3600s')
   * @returns Time in seconds
   */
  private parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([dhms]?)$/);
    if (!match) {
      return 604800; // Default to 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2] || 's';

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60;
      case 'h':
        return value * 60 * 60;
      case 'm':
        return value * 60;
      case 's':
      default:
        return value;
    }
  }

  /**
   * Hash password using UserService
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return this.userService.hashPassword(password);
  }

  /**
   * Compare password with hash using UserService
   * @param password Plain text password
   * @param hash Hashed password
   * @returns True if passwords match
   */
  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return this.userService.verifyPassword(password, hash);
  }
}
