import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDeckResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user-deck relationship',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Deck ID',
    example: 1,
  })
  deckId: number;

  @ApiProperty({
    description: 'Role of the user in the deck',
    example: 'member',
    enum: ['admin', 'member'],
  })
  role: string;

  @ApiPropertyOptional({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      email: { type: 'string', example: 'user@example.com' },
      name: { type: 'string', example: 'John Doe' },
    },
  })
  user?: {
    id: number;
    email: string;
    name: string | null;
  };
}

export class DeckResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the deck',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the deck',
    example: 'Spanish Vocabulary',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the deck',
    example: 'A comprehensive deck for learning basic Spanish vocabulary',
  })
  description: string | null;

  @ApiProperty({
    description: 'Whether the deck is public or private',
    example: false,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-07-05T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-07-05T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'ID of the parent deck if this is a subdeck',
    example: 1,
  })
  parentDeckId: number | null;

  @ApiPropertyOptional({
    description: 'User-deck relationships',
    type: [UserDeckResponseDto],
  })
  userDecks?: UserDeckResponseDto[];

  @ApiPropertyOptional({
    description: 'Subdecks of this deck',
    type: [DeckResponseDto],
  })
  subDecks?: DeckResponseDto[];

  @ApiPropertyOptional({
    description: 'Parent deck information',
    type: DeckResponseDto,
  })
  parentDeck?: DeckResponseDto;
}
