import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AppResponseSuccessInterface } from 'src/helpers/response';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'accountNumber',
    });
  }

  async validate(
    accountNumber: string,
    password: string,
  ): Promise<AppResponseSuccessInterface> {
    return this.authService.signIn(accountNumber, password);
  }
}
