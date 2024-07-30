import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class RemoveUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsNotEmpty()
  authorizationPin: string;

  @IsEmail()
  email: string;
}
