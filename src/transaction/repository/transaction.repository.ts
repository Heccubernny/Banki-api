import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppResponse } from 'src/helpers/response';
import {
  Transactions,
  TrnxType,
} from 'src/transaction/entities/transaction.entity';
import { User, UserDocument } from 'src/user/entities/user.entity';

@Injectable()
export default class TransactionRepository {
  constructor(
    @InjectModel(Transactions.name)
    private trnxModel: Model<Transactions>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async debitAccount({
    amount,
    accountNumber,
    purpose,
    reference,
    description,
    session,
  }) {
    const user = await this.userModel.findOne({ accountNumber });

    console.log('\t The Debit Account secction \n');
    console.log(user);

    if (!user) {
      throw new NotFoundException(`${accountNumber} does not exist`);
    }

    if (Number(user.balance) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const updatedWallet = await this.userModel.findOneAndUpdate(
      { accountNumber },
      { $inc: { balance: -amount } },
      { session },
    );
    console.log(updatedWallet);

    const recipientlName = await this.userModel.findOne(
      {
        accountNumber,
      },
      { firstName: 1, lastName: 1 },
    );

    console.log(recipientlName);

    const fullNameTransactionEntity = `${recipientlName.firstName} ${recipientlName.lastName}`;
    console.log(fullNameTransactionEntity);
    const transaction = await this.trnxModel.create(
      [
        {
          trnxType: TrnxType.CREDIT,
          purpose,
          amount,
          accountNumber,
          reference,
          previousBalance: Number(user.balance),
          newBalance: Number(user.balance) - Number(amount),
          description,
          fullNameTransactionEntity,
        },
      ],
      {
        session,
      },
    );

    console.log(transaction);

    const message = {
      notification: {
        title: 'Debit',
        body: `You just sent ₦ ${amount} to ${fullNameTransactionEntity}`,
      },
      token: user.token,
    };

    return AppResponse.success({
      statusCode: HttpStatus.CREATED,
      message: 'Debited successfully',
      data: { updatedWallet, transaction },
    });
  }
  async creditAccount({
    amount,
    accountNumber,
    purpose,
    reference,
    description,
    session,
  }) {
    const user = await this.userModel.findOne({ accountNumber });
    console.log('\t The Credit Account secction \n');

    if (!user) {
      throw new NotFoundException(`${accountNumber} does not exist`);
    }
    console.log(user);

    if (Number(user.balance) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const updatedWallet = await this.userModel.findOneAndUpdate(
      { accountNumber },
      { $inc: { balance: amount } },
      { session },
    );
    console.log(updatedWallet);

    const senderFullName = await this.userModel.findOne(
      {
        accountNumber,
      },
      { firstName: 1, lastName: 1 },
    );

    console.log(senderFullName);

    const fullNameTransactionEntity = `${senderFullName.firstName} ${senderFullName.lastName}`;
    console.log(fullNameTransactionEntity);

    const transaction = await this.trnxModel.create(
      [
        {
          trnxType: TrnxType.CREDIT,
          purpose,
          amount,
          accountNumber,
          reference,
          previousBalance: Number(user.balance),
          newBalance: Number(user.balance) + Number(amount),
          description,
          fullNameTransactionEntity,
        },
      ],
      {
        session,
      },
    );

    console.log(transaction);

    const message = {
      notification: {
        title: 'Debit',
        body: `You just sent ₦ ${amount} to ${fullNameTransactionEntity}`,
      },
      token: user.token,
    };

    // send this message to the notification system and also modify it to send a mail to the user if he option for mail notification in their settings preference

    return AppResponse.success({
      statusCode: HttpStatus.CREATED,
      message: 'Credited successfully',
      data: { updatedWallet, transaction },
    });
  }
  async availableBalance({ accountNumber }: { accountNumber: string }) {
    return await this.userModel.findOne({ accountNumber }, { balance: 1 });
  }
}
