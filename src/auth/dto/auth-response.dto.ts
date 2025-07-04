import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
    enum: ['Bearer'],
  })
  token_type: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 604800,
  })
  expires_in: number;

  @ApiProperty({
    description: 'User information',
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
      name: {
        type: 'string',
        description: 'User full name',
        example: 'John Doe',
      },
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
  };
}
