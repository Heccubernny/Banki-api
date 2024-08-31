import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Role } from '../entities/user.entity';
export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsString()
  @IsEnum(Role)
  @IsNotEmpty()
  @IsOptional()
  role?: string;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  // @MinLength(11)
  // @MaxLength(11)
  phoneNumber: string;

  // @IsNotEmpty()
  password: string;
}
