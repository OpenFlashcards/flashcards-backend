import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeckDto {
  @ApiProperty({
    description: 'Name of the deck',
    example: 'Spanish Vocabulary',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the deck',
    example: 'A comprehensive deck for learning basic Spanish vocabulary',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the deck is public or private',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'ID of the parent deck if this is a subdeck',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  parentDeckId?: number;
}
