import { ApiProperty } from '@nestjs/swagger';

export class NotFoundErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Resource not found',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Not Found',
  })
  error: string;
}

export class ConflictErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 409,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Resource already exists',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Conflict',
  })
  error: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed',
  })
  message: string | string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request',
  })
  error: string;
}

export class ForbiddenErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 403,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Insufficient permissions to perform this action',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Forbidden',
  })
  error: string;
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Unauthorized',
  })
  message: string;

  @ApiProperty({
    description: 'Error type',
    example: 'Unauthorized',
  })
  error: string;
}
