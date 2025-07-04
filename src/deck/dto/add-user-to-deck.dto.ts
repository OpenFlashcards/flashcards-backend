import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export class AddUserToDeckDto {
  @ApiProperty({
    description: 'Email address of the user to add to the deck',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role to assign to the user in the deck',
    enum: UserRole,
    example: UserRole.MEMBER,
    default: UserRole.MEMBER,
  })
  @IsEnum(UserRole)
  role: UserRole = UserRole.MEMBER;
}
