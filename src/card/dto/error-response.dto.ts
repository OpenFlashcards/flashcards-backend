import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Bad Request',
  })
  message: string;

  @ApiProperty({
    description: 'Detailed error description',
    example: 'Validation failed for the provided data',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Timestamp of the error',
    example: '2024-07-05T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path',
    example: '/api/v1/cards',
  })
  path: string;
}
