import {
  Injectable,
  ConflictException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);

      // Validate that either password or external provider ID is provided
      if (
        !createUserDto.password &&
        !createUserDto.appleId &&
        !createUserDto.googleId
      ) {
        throw new BadRequestException(
          'Either password or external provider ID (Apple/Google) must be provided',
        );
      }

      // Hash password if provided (using crypto with salt for better security)
      let hashedPassword: string | undefined;
      if (createUserDto.password) {
        hashedPassword = this.hashPassword(createUserDto.password);
      }

      // Prepare user data
      const userData: Prisma.UserCreateInput = {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
        appleId: createUserDto.appleId,
        googleId: createUserDto.googleId,
        provider: createUserDto.provider || 'email',
      };

      // Create user in database
      const user = await this.prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          name: true,
          appleId: true,
          googleId: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`Successfully created user with ID: ${user.id}`);

      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);

      // Handle unique constraint violations
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target as string[];
          if (field?.includes('email')) {
            throw new ConflictException('User with this email already exists');
          }
          if (field?.includes('appleId')) {
            throw new ConflictException(
              'User with this Apple ID already exists',
            );
          }
          if (field?.includes('googleId')) {
            throw new ConflictException(
              'User with this Google ID already exists',
            );
          }
        }
      }

      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<UserResponseDto | null> {
    try {
      this.logger.log(`Finding user by email: ${email}`);

      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          appleId: true,
          googleId: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to find user by email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findUserById(id: number): Promise<UserResponseDto | null> {
    try {
      this.logger.log(`Finding user by ID: ${id}`);

      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          appleId: true,
          googleId: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to find user by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Find user by email with password (for authentication)
   */
  async findByEmail(email: string) {
    try {
      this.logger.log(`Finding user by email for authentication: ${email}`);

      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          appleId: true,
          googleId: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to find user by email for auth: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Verify a plain password against a stored hash
   */
  verifyPassword(plainPassword: string, hashedPassword: string): boolean {
    try {
      const salt = this.configService.passwordSalt;
      const hashToVerify = crypto
        .createHash('sha256')
        .update(plainPassword + salt)
        .digest('hex');

      return hashToVerify === hashedPassword;
    } catch (error) {
      this.logger.error(`Failed to verify password: ${error.message}`);
      return false;
    }
  }

  /**
   * Hash a plain password using the configured salt
   */
  hashPassword(plainPassword: string): string {
    const salt = this.configService.passwordSalt;
    return crypto
      .createHash('sha256')
      .update(plainPassword + salt)
      .digest('hex');
  }
}
