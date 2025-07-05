import { ApiProperty } from '@nestjs/swagger';

export class CardResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the card',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The question text for the flashcard',
    example: 'What is the capital of France?',
  })
  question: string;

  @ApiProperty({
    description: 'The answer text for the flashcard',
    example: 'Paris',
  })
  answer: string;

  @ApiProperty({
    description: 'ID of the deck this card belongs to',
    example: 5,
  })
  deckId: number;

  @ApiProperty({
    description: 'ID of the user who created this card',
    example: 2,
    nullable: true,
  })
  createdById: number | null;

  @ApiProperty({
    description: 'Name of the user who created this card',
    example: 'John Doe',
    nullable: true,
  })
  createdByName: string | null;

  @ApiProperty({
    description: 'Timestamp when the card was created',
    example: '2024-07-05T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the card was last updated',
    example: '2024-07-05T10:30:00.000Z',
  })
  updatedAt: Date;
}
