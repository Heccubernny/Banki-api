import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationModule } from './notification/notification.module';
import { OrganisationModule } from './organisation/organisation.module';
import { PaymentModule } from './payment/payment.module';
import { SettingModule } from './setting/setting.module';
import { TransactionModule } from './transaction/transaction.module';
import { User, UserSchema } from './user/entities/user.entity';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import * as Joi from 'joi';

@Module({
  imports: [
    SettingModule,
    PaymentModule,
    AdminModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRY: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    // ThrottlerModule.forRoot({ limit: 10, ttl: 60 }),
    MongooseModule.forRoot(process.env.DATABASE_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
    ActivityLogModule,
    NotificationModule,
    MessagingModule,
    OrganisationModule,
    TransactionModule,
    AuthModule,
    JwtModule,
  ],
  controllers: [AppController, AuthController, UserController],
  providers: [AppService, AuthService, UserService],
})
export class AppModule {}
