import {
  BadRequestException,
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
import { User } from 'src/user/entities/user.entity';
import { AddMoneyTransactionDto } from './dto/add-money-transaction.dto';
import { TransactionDto } from './dto/transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  Purpose,
  TransactionDocument,
  Transactions,
  TrnxType,
} from './entities/transaction.entity';
import TransactionRepository from './repository/transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Transactions.name) private trnxModel: Model<Transactions>,
    private trnxRepo: TransactionRepository,
  ) {}

  async availableBalance({ accountNumber }: { accountNumber: string }) {
    const findAccountNumber = await this.userModel.findOne({
      accountNumber,
    });

    if (!findAccountNumber) {
      throw new NotFoundException(`Account number is not available`);
    }
    // gender to check if the person is a male then return mr or miss
    const getAccountNumber =
      await this.trnxRepo.availableBalance(findAccountNumber);
    return AppResponse.success({
      message: `Hey, dear ${findAccountNumber.lastName} your balance remains ${getAccountNumber.balance}`,
      data: getAccountNumber.balance,
    });
  }

  async getCustomerDetails(accountNumber: string) {
    const findAccountNumber = await this.userModel.findOne({
      accountNumber,
    });

    if (!findAccountNumber) {
      throw new NotFoundException(`Account number is not available`);
    }

    const getRecentTransactions = await this.trnxRepo.getCustomerTransaction(
      findAccountNumber.accountNumber,
    );

    // let trnxResult;

    // const getUserwithtransactions = await this.userModel
    //   .aggregate([
    //     { $match: { accountNumber: findAccountNumber.accountNumber } },
    //     {
    //       $lookup: {
    //         from: 'transactions',
    //         localField: 'transactions',
    //         foreignField: '_id',
    //         as: 'transactionDetails',
    //       },
    //     },
    //   ])
    //   .exec();

    // const transactions = getRecentTransactions.map(async (trnx) => {
    //   trnxResult = await this.trnxModel.find(trnx);
    //   return trnxResult;
    // });
    return AppResponse.success({
      message: `Successfully fetch ${accountNumber} recent transactions`,
      data: getRecentTransactions,
    });
  }
  async tierLevelChecker(tierLevel, addMoneyTransactionDto) {
    if (tierLevel === 1) {
      const getUser = await this.userModel.findOne({
        accountNumber: addMoneyTransactionDto.receiver,
      });

      if (!getUser) {
        throw new BadRequestException(userConstants.NOT_FOUND);
      }
      // for transfer to someone with tier 1 priviledge
      const tierOneTransferAmountLimit = 200000.0;
      if (
        addMoneyTransactionDto.amount.toFixed(2) > tierOneTransferAmountLimit
      ) {
        // fix this issue. it still exceed more than 1 million
        if (Number(getUser.balance.toFixed(2)) > Number(1000000.0)) {
          throw new BadRequestException(
            `Due to your current tier level, your balance can't exceed 1000000. Please try to upgrade to a higer tier`,
          );
        }
        return AppResponse.error({
          statusCode: 400,
          message: `Maximum amount that can be funded is ${tierOneTransferAmountLimit}`,
        });
      }

      if (tierLevel === 2) {
        const tierTwoTransferAmountLimit = 500000.0;
        if (
          addMoneyTransactionDto.amount.toFixed(2) > tierTwoTransferAmountLimit
        ) {
          if (Number(getUser.balance.toFixed(2)) > Number(5000000.0)) {
            throw new BadRequestException(
              `Due to your current tier level, your balance can't exceed 1000000. Please try to upgrade to a higer tier`,
            );
          }
          return AppResponse.error({
            statusCode: 400,
            message: `Maximum amount that can be funded is ${tierTwoTransferAmountLimit}`,
          });
        }
      }

      if (tierLevel === 3) {
        const tierThreeTransferAmountLimit = 1000000.0;
        if (
          addMoneyTransactionDto.amount.toFixed(2) >
          tierThreeTransferAmountLimit
        ) {
          if (Number(getUser.balance.toFixed(2)) > Number(10000000.0)) {
            throw new BadRequestException(
              `Due to your current tier level, your balance can't exceed 1000000. Please try to upgrade to a higer tier`,
            );
          }
          return AppResponse.error({
            statusCode: 400,
            message: `Maximum amount that can be funded is ${tierThreeTransferAmountLimit}`,
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
      console.log(
        await this.tierLevelChecker(tierLevel, addMoneyTransactionDto),
      );
      await this.tierLevelChecker(tierLevel, addMoneyTransactionDto);
      await this.userModel.findOneAndUpdate(
        { accountNumber },
        { balance: accountNumber.balance + addMoneyTransactionDto.amount },
      );

      let fundAccount: TransactionDocument;

      switch (addMoneyTransactionDto.methodToUse) {
        case 'Bank Transfer':
          // convert it to a reusable function
          // get bank api to get the money from  and also option to choose from which bank he wants to make the bank transfer from
          fundAccount = await this.trnxModel.create({
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
          break;
        case 'Card':
          console.log('Card it is');
          break;
        case 'Deposit':
          console.log('Deposit with your bank');
          break;
        case 'QR Code':
          console.log('QR Code');
          break;
        default:
          console.log('Used method is not available');
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

      accountNumber.transactions.push(fundAccount.id);
      accountNumber.save();

      return AppResponse.success({
        message: `${addMoneyTransactionDto.amount} has been successfully added to your Banki wallet`,
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
