import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Transactions,
  TransactionSchema,
} from 'src/transaction/entities/transaction.entity';
import { User, UserSchema } from 'src/user/entities/user.entity';
import TransactionRepository from '../transaction/repository/transaction.repository';
import { TransactionService } from '../transaction/transaction.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transactions.name, schema: TransactionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, TransactionService, TransactionRepository],
})
export class AdminModule {}
