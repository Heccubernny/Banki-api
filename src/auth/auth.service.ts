import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { AppResponse, AppResponseSuccessInterface } from 'src/helpers/response';
import { UserDocument } from 'src/user/entities/user.entity';
import { TokenPayload } from 'src/user/interface/token.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //   async signUp(createUserDto: CreateUserDto) {
  //     const attributesToExclude = [
  //       'password',
  //       'pin',
  //       'phoneNumber',
  //       'createdAt',
  //       'updatedAt',
  //     ];

  //     const hashedPassword = (await hash(createUserDto.password, 8)).toString();
  //     console.log(hashedPassword);

  //     const accountNumber = createUserDto.phoneNumber.slice(1);
  //     const userExists = await this.userService.findOne(accountNumber);

  //     if (userExists) {
  //       throw new BadRequestException(userConstants.ALREADY_EXISTS);
  //     }

  //     const createUser = await this.userService.create(createUserDto);
  //     // if (userExists) {
  //     //   throw new Error('Email already exists');
  //     // }

  //     return await createUser.save();
  //   }

  async signIn(
    accountNumber: string,
    password: string,
  ): Promise<AppResponseSuccessInterface> {
    const user: UserDocument = await this.userService.findOne(accountNumber);

    const passwordMatch = await this.verifyPassword(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException(`User ${accountNumber} does not exist`);
    }

    const access_token = await this.getCookiesWithJwtToken(user);
    console.log(access_token);
    return AppResponse.success({
      message: 'Sign In successfully',
      data: access_token,
    });
  }

  public getCookieForLogout() {
    const result = `Authentication; HttpOnly; Path=/; Max-Age=0`;

    return AppResponse.success({
      message: 'Logout Successfully',
      data: result,
    });
  }
  private async getCookiesWithJwtToken(user: UserDocument) {
    const payload: TokenPayload = {
      id: user.id,
      accountNumber: user.accountNumber,
    };
    const access_token = await this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    const link = `Authentication=${access_token}; HttpOnly; Path=/; Max-Age=${this.configService.get<string>('JWT_EXPIRY')}`;

    return link;
  }
  private async verifyPassword(password: string, hashPassword: string) {
    const doesItMatch = await compare(password, hashPassword);
    if (!doesItMatch)
      throw new HttpException(
        'Wrong Credentials provided, ',
        HttpStatus.BAD_REQUEST,
      );

    return doesItMatch;
  }
}
