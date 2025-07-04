import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'User display name',
    example: 'John Doe',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Apple ID for Apple authentication',
    example: 'apple_user_id_123',
  })
  appleId?: string;

  @ApiPropertyOptional({
    description: 'Google ID for Google authentication',
    example: 'google_user_id_123',
  })
  googleId?: string;

  @ApiProperty({
    description: 'Authentication provider used',
    example: 'email',
    enum: ['email', 'apple', 'google'],
  })
  provider: string;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2025-07-04T21:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2025-07-04T21:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
