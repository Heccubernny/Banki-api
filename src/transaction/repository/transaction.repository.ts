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
import { User } from 'src/user/entities/user.entity';

@Injectable()
export default class TransactionRepository {
  constructor(
    @InjectModel(Transactions.name)
    private trnxModel: Model<Transactions>,

    @InjectModel(User.name)
    private userModel: Model<User>,
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
    // const getTrnxPurpose = transaction.purpose;

    // const message = {
    //   notification: {
    //     title: 'Credit',
    //     body:
    //       getTrnxPurpose === 'Transfer'
    //         ? `You just receive ₦ ${amount} from ${fullNameTransactionEntity}`
    //         : `You got credited a sum of ₦ ${amount}`,
    //   },
    //   token: user.token,
    // };

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

  async getUserRecentTransaction(accountNumber: string) {
    const getAccountNumber = await this.userModel.findOne({
      accountNumber,
    });

    const accountTransaction = getAccountNumber.transactions;
    // if (accountTransaction.length === 0) {
    //   return 'No transactions found';
    // }
    const getRecentTransactions = accountTransaction.reverse();
    return getRecentTransactions;
  }
  async getCustomerTransactionByType(
    accountNumber: string,
    transactionType: string,
  ) {
    const getRecentTransactions =
      await this.getUserRecentTransaction(accountNumber);
    const getUserTransactionsByType = await this.trnxModel
      .find(
        {
          _id: { $in: getRecentTransactions },
          trnxType: { $eq: transactionType },
        },
        { updatedAt: 0, __v: 0 },
      )
      .exec();

    return getUserTransactionsByType;
  }

  async getCustomerTransaction(accountNumber: string) {
    const getRecentTransactions =
      await this.getUserRecentTransaction(accountNumber);
    const getUserWithtransactions = await this.trnxModel
      .find(
        {
          _id: { $in: getRecentTransactions },
        },
        { updatedAt: 0, __v: 0 },
      )
      .exec();

    return getUserWithtransactions;
  }
}
