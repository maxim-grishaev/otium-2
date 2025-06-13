import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsDate,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import type { DbRawUser } from '../db/schema';

export class UserDto {
  constructor(user: DbRawUser) {
    Object.assign(this, user);
  }

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string; // Will be hashed

  @IsNotEmpty()
  @MaxLength(255)
  firstName: string;

  @IsNotEmpty()
  @MaxLength(255)
  lastName: string;

  @IsDate()
  createdAt: string;
  @IsDate()
  updatedAt: string;

  @IsString()
  @Exclude()
  passwordHash: string;
}
