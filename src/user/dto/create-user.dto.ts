import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'User password (required for email authentication)',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Apple ID for Apple authentication',
    example: 'apple_user_id_123',
  })
  @IsOptional()
  @IsString()
  appleId?: string;

  @ApiPropertyOptional({
    description: 'Google ID for Google authentication',
    example: 'google_user_id_123',
  })
  @IsOptional()
  @IsString()
  googleId?: string;

  @ApiPropertyOptional({
    description: 'Authentication provider',
    example: 'email',
    enum: ['email', 'apple', 'google'],
    default: 'email',
  })
  @IsOptional()
  @IsString()
  provider?: string;
}
