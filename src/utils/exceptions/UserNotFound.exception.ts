import { HttpException, HttpStatus } from '@nestjs/common';

class UserNotFoundException extends HttpException {
  constructor(userId: number) {
    super(`User with id ${userId} is not found.`, HttpStatus.NOT_FOUND);
  }
}
