import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  @InjectModel(User.name) private userModel: Model<User>;
  async sendPushNotification(createNotificationDto: CreateNotificationDto) {
    try {
      const usersTokens = await this.userModel.find().exec();
      let registrationTokens = usersTokens.map((user) => user.token.token);
      registrationTokens = registrationTokens.filter(
        (token) => token !== null && token !== undefined && token !== '',
      );

      console.log(registrationTokens);

      const message = {
        tokens: registrationTokens,
        notification: {
          title: createNotificationDto.title,
          body: createNotificationDto.body,
        },
      };

      // firebaseAdmin
      console.log(message);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return 'This action adds a new notification';
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
