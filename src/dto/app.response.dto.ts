import { HttpStatus } from '@nestjs/common';
import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class ResponseDto {
  statusCode?: HttpStatus;

  @IsString()
  @IsNotEmpty()
  message: string | string[] | object;
}
export class AppErrorResponseDto extends ResponseDto {
  error?: string;
}

export class AppSuccessResponseDto extends ResponseDto {
  @IsObject()
  @IsString()
  @IsArray()
  data?: any;
}
