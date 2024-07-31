import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { Response } from 'express';
import { RequestWithUser } from './auth.interface';
import { AuthRequestDto, AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiResponse({
  description: 'Authentication endpoint',
  type: AuthResponseDto,
  status: HttpStatus.OK,
})
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(LocalAuthGuard)
  async signIn(
    @Req() request: RequestWithUser,
    @Res() response: Response,
    @Body() authRequestDto: AuthRequestDto,
  ) {
    const result = await this.authService.signIn(
      authRequestDto.accountNumber,
      authRequestDto.password,
    );
    console.log(result);
    response.setHeader('Set-Cookie', result.data);

    return result;
  }
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }
  // @UseGuards(JwtAuthGuard)
  // @ApiBasicAuth()
  @Post('logout')
  async logout(@Req() request: RequestWithUser, @Res() response: Response) {
    const result = this.authService.getCookieForLogout();
    response.setHeader('Set-Cookie', result.data);

    return result;
  }
}
