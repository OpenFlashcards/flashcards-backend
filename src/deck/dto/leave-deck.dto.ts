import { ApiProperty } from '@nestjs/swagger';

export class LeaveDeckResponseDto {
  @ApiProperty({
    description: 'Whether the deck was deleted after the user left',
    example: false,
  })
  deckDeleted: boolean;

  @ApiProperty({
    description: 'Message describing what happened',
    example: 'Successfully left the deck',
  })
  message: string;

  @ApiProperty({
    description: 'ID of the new admin (if one was promoted)',
    example: 2,
    required: false,
  })
  newAdminId?: number;
}
