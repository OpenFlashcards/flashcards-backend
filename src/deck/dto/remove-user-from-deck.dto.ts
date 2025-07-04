import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveUserFromDeckDto {
  @ApiProperty({
    description: 'ID of the user to remove from the deck',
    example: 2,
  })
  @IsInt()
  userId: number;
}
