import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard, JwtAuthGuard } from './guards';
import { Public, CurrentUser } from './decorators';
import { LoginDto, AuthResponseDto, AuthErrorDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password and return JWT token',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: AuthErrorDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request body',
    type: AuthErrorDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: AuthErrorDto,
  })
  async login(@Request() req): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile',
    description:
      'Get the profile information of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'User ID',
          example: 'clm1234567890',
        },
        email: {
          type: 'string',
          description: 'User email address',
          example: 'user@example.com',
        },
        name: {
          type: 'string',
          description: 'User full name',
          example: 'John Doe',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid or missing JWT token',
    type: AuthErrorDto,
  })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verify JWT token',
    description:
      'Verify if the provided JWT token is valid and return user information',
  })
  @ApiResponse({
    status: 201,
    description: 'Token is valid',
    schema: {
      type: 'object',
      properties: {
        valid: {
          type: 'boolean',
          description: 'Token validity status',
          example: true,
        },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
              example: 'clm1234567890',
            },
            email: {
              type: 'string',
              description: 'User email',
              example: 'user@example.com',
            },
          },
        },
        expiresAt: {
          type: 'number',
          description: 'Token expiration timestamp',
          example: 1720192200,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired token',
    type: AuthErrorDto,
  })
  async verifyToken(@CurrentUser() user: any) {
    return {
      valid: true,
      user,
      expiresAt: Math.floor(Date.now() / 1000) + 604800, // Current time + 7 days
    };
  }
}
