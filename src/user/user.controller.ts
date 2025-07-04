import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import {
  ConflictErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common';
import { Public } from '../auth/decorators';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a new user account. Requires either email/password or external provider authentication.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation data',
    examples: {
      emailUser: {
        summary: 'Email/Password User',
        description: 'Create user with email and password',
        value: {
          email: 'user@example.com',
          password: 'securePassword123',
          name: 'John Doe',
          provider: 'email',
        },
      },
      googleUser: {
        summary: 'Google User',
        description: 'Create user with Google authentication',
        value: {
          email: 'user@gmail.com',
          googleId: 'google_user_id_123',
          name: 'Jane Smith',
          provider: 'google',
        },
      },
      appleUser: {
        summary: 'Apple User',
        description: 'Create user with Apple authentication',
        value: {
          email: 'user@icloud.com',
          appleId: 'apple_user_id_123',
          name: 'Bob Johnson',
          provider: 'apple',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or missing required fields',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with email/appleId/googleId already exists',
    type: ConflictErrorResponseDto,
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.createUser(createUserDto);
  }
}
