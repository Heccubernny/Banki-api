import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { userConstants } from 'src/helpers/appConstants';
import { Utils } from 'src/helpers/utils';
import { AppResponse } from './../helpers/response';
import { CreateUserDto } from './dto/create-user.dto';
import { RemoveUserDto } from './dto/remove-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const attributesToExclude = [
      'password',
      'pin',
      'phoneNumber',
      'updatedAt',
      'transactions',
      'role',
      'payment',
      'notification',
    ];

    const hashedPassword = (await hash(createUserDto.password, 8)).toString();
    const userExists = await this.userModel.findOne({
      $or: [
        { email: createUserDto.email },
        { phoneNumber: createUserDto.phoneNumber },
      ],
    });

    if (userExists) {
      throw new BadRequestException(userConstants.ALREADY_EXISTS);
    }

    const accountNumber = createUserDto.phoneNumber.slice(1);
    const createUser = new this.userModel({
      ...createUserDto,
      accountNumber,
      password: hashedPassword,
    });
    // if (userExists) {
    //   throw new Error('Email already exists');
    // }

    const result = await createUser.save();
    // result.password = result.pin = undefined;
    return Utils.attributesToExclude(result, attributesToExclude);
  }

  async findAll() {
    const user = await this.userModel.findOne(
      { accountNumber: '9012345678' },
      { pin: 0, password: 0 },
    );

    return user;
  }

  async findOne(accountNumber: string) {
    const user = await this.userModel.findOne({ accountNumber }, { pin: 0 });
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async closeAccount(removeUserDto: RemoveUserDto) {
    const userExists = await this.userModel.findOne({
      email: removeUserDto.email,
    });

    if (!userExists) {
      throw new NotFoundException(userConstants.NOT_FOUND);
    }

    const adminAuthPin = '4444';

    // const adminAuthPin = await this.adminModel({ pin: removeUserDto.authorizationPin });
    // const isMatch = compare(removeUserDto.authorizationPin, adminAuthPin);

    if (removeUserDto.authorizationPin !== adminAuthPin) {
      throw new NotAcceptableException(userConstants.INVALID_AUTHORIZATION_PIN);
    }

    await this.userModel.findOneAndDelete({ email: removeUserDto.email });

    const successData = {
      // status: HttpStatus.OK,
      message: userConstants.DELETE_USER_MESSAGE,
      data: removeUserDto.email,
    };
    return AppResponse.success(successData);
  }
}
