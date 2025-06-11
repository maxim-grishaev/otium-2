import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password: string; // Will be hashed

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;
}
