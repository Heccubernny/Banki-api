import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model } from 'mongoose';
import UUIDGenerator from 'src/helpers/UUIDGenerator';
import { userConstants } from 'src/helpers/appConstants';
import { AppResponse } from 'src/helpers/response';
import { User, UserDocument } from 'src/user/entities/user.entity';
import { AddMoneyTransactionDto } from './dto/add-money-transaction.dto';
import { TransactionDto } from './dto/transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Purpose, Transactions, TrnxType } from './entities/transaction.entity';
import TransactionRepository from './repository/transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Transactions.name) private trnxModel: Model<Transactions>,
    private trnxRepo: TransactionRepository,
  ) {}

  async availableBalance({ accountNumber }: { accountNumber: string }) {
    const findAccountNumber = await this.userModel.findOne({
      accountNumber,
    });

    if (!findAccountNumber) {
      throw new NotFoundException(`Account nuber is not available`);
    }
    // gender to check if the person is a male then return mr or miss
    const getAccountNumber =
      await this.trnxRepo.availableBalance(findAccountNumber);
    return AppResponse.success({
      message: `Hey, dear ${findAccountNumber.lastName} your balance remains ${getAccountNumber.balance}`,
      data: getAccountNumber.balance,
    });
  }

  async tierLevelChecker(tierLevel, addMoneyTransactionDto) {
    if (tierLevel === 1) {
      // for transfer to someone with tier 1 priviledge
      const tierOneAmountLimit = 200000;
      if (addMoneyTransactionDto.amount > tierOneAmountLimit) {
        return AppResponse.error({
          statusCode: 400,
          message: `Maximum amount that can be funded is ${tierOneAmountLimit}`,
        });
      }
      if (tierLevel === 2) {
        const tierTwoAmountLimit = 500000;
        if (addMoneyTransactionDto.amount > tierTwoAmountLimit) {
          return AppResponse.error({
            statusCode: 400,
            message: `Maximum amount that can be funded is ${tierTwoAmountLimit}`,
          });
        }
      }

      if (tierLevel === 3) {
        const tierThreeAmountLimit = 1000000;
        if (addMoneyTransactionDto.amount > tierThreeAmountLimit) {
          return AppResponse.error({
            statusCode: 400,
            message: `Maximum amount that can be funded is ${tierThreeAmountLimit}`,
          });
        }
      }
    }
  }
  async addMoney(addMoneyTransactionDto: AddMoneyTransactionDto) {
    const reference = UUIDGenerator.generate();
    try {
      const accountNumber = await this.userModel.findOne({
        accountNumber: addMoneyTransactionDto.receiver,
      });
      if (!accountNumber) {
        throw new NotFoundException(userConstants.NOT_FOUND);
      }

      const tierLevel = accountNumber.tier;

      await this.userModel.findOneAndUpdate(
        { accountNumber },
        { balance: accountNumber.balance + addMoneyTransactionDto.amount },
      );

      await this.tierLevelChecker(tierLevel, addMoneyTransactionDto);
      switch (addMoneyTransactionDto.methodToUse) {
        case 'Bank Transfer':
          await this.trnxModel.create({
            trnxType: TrnxType.FUNDING,
            purpose: Purpose.DEPOSIT,
            amount: addMoneyTransactionDto.amount,
            accountNumber: accountNumber,
            reference,
            previousBalance: Number(accountNumber.balance),
            newBalance:
              Number(accountNumber.balance) +
              Number(addMoneyTransactionDto.amount),
            description: `Wallet Funding using ${addMoneyTransactionDto.methodToUse}`,
            fullNameTransactionEntity: `${accountNumber.firstName} ${accountNumber.lastName}`,
          });
        case 'Card':
          console.log('Card it is');
        case 'Deposit':
          console.log('Deposit with your bank');
        case 'QR Code':
          console.log('QR Code');
      }

      await this.userModel.findOneAndUpdate(
        {
          accountNumber: accountNumber.accountNumber,
        },
        {
          balance:
            Number(accountNumber.balance) +
            Number(addMoneyTransactionDto.amount),
        },
      );

      return AppResponse.success({
        message: 'Amount funded succefully to account',
      });
    } catch (err) {
      return AppResponse.error({ message: err.message });
    }
  }

  async transferToBanki(transactionDto: TransactionDto) {
    const session: ClientSession = await mongoose.startSession();
    console.log('\t The Main Account secction \n');

    console.log(session);
    session.startTransaction();

    try {
      const reference = UUIDGenerator.generate();

      if (
        !transactionDto.recipient ||
        !transactionDto.sender ||
        !transactionDto.amount ||
        !transactionDto.description
      ) {
        await session.endSession();
        throw new NotFoundException(
          `Please provide the follwing details: ${transactionDto.recipient}.${transactionDto.sender}.${transactionDto.amount}.${transactionDto.description}`,
        );
      }
      const accountNumber = await new this.userModel({
        accountNumber: transactionDto.sender,
      });
      console.log(accountNumber.lastName);
      const transferResult = await Promise.all([
        this.trnxRepo.creditAccount({
          amount: transactionDto.amount,
          accountNumber: transactionDto.recipient,
          purpose: Purpose.TRANSFER,
          reference,
          session,
          description: transactionDto.description,
        }),

        this.trnxRepo.debitAccount({
          amount: transactionDto.amount,
          accountNumber: transactionDto.sender,
          purpose: Purpose.TRANSFER,
          reference,
          session,
          description: transactionDto.description,
        }),
      ]);
      console.log(`Transfer Result: ${transferResult}`);
      const failedTrxns = transferResult.filter(
        (result) => result.statusCode !== HttpStatus.CREATED,
      );

      console.log(failedTrxns);
      if (failedTrxns.length) {
        const errors = failedTrxns.map((trxn) => trxn.message);
        await session.abortTransaction();
        await session.endSession();
        throw new ConflictException(errors.join(' '));
      }

      console.log(`Commit transaction ${session}`);
      //
      await session.commitTransaction();
      console.log(`End transaction ${session}`);

      await session.endSession();

      return AppResponse.success({
        statusCode: HttpStatus.CREATED,
        message: 'Transfer successful',
        data: transferResult,
      });
    } catch (err) {
      await session.abortTransaction();
      await session.endSession();
      return AppResponse.error({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Unable to perform transfer. Please try again. \n Error:${err.message}`,
      });
    }
  }

  findAll() {
    return `This action returns all transaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates 
    ${updateTransactionDto.amount}
    a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
