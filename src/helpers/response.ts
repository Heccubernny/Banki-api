import { HttpStatus } from '@nestjs/common';
import {
  AppErrorResponseDto,
  AppSuccessResponseDto,
} from 'src/dto/app.response.dto';

export interface AppResponseSuccessInterface {
  statusCode: HttpStatus;
  message: string | object | string[];
  data: any;
}
export class AppResponse {
  static error(error: AppErrorResponseDto) {
    return {
      statusCode: error.statusCode ? error.statusCode : HttpStatus.BAD_REQUEST,
      message: error.message,
      error: error.error ? error.error : 'Bad Request',
    };
  }

  static success(data: AppSuccessResponseDto) {
    return {
      statusCode: data.statusCode ? data.statusCode : HttpStatus.OK,
      message: data.message,
      data: data.data,
    };
  }
}
