import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCardDto {
  @ApiProperty({
    description: 'The question text for the flashcard',
    example: 'What is the capital of France?',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  question: string;

  @ApiProperty({
    description: 'The answer text for the flashcard',
    example: 'Paris',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  answer: string;

  @ApiProperty({
    description: 'Additional notes or explanation for the card (optional)',
    example:
      'Paris is the largest city in France and has been the capital since 987 AD.',
    required: false,
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
