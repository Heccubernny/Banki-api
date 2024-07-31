import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, ValidateIf } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/user/entities/user.entity';
export type TransactionDocument = HydratedDocument<Transactions>;

export enum TrnxType {
  CREDIT = 'Credit',
  DEBIT = 'Debit',
  WALLET = 'Wallet',
  FUNDING = 'Funding',
}

export enum Purpose {
  TRANSFER = 'Transfer',
  DEPOSIT = 'Deposit',
}

export enum Status {
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

@Schema({
  timestamps: true,
})
export class Transactions {
  @Prop({ enum: TrnxType, required: true })
  @ApiProperty({
    example: 'Funding',
    enum: TrnxType,
    required: true,
    description: 'Transaction type been made',
  })
  trnxType: string;
  @Prop({ enum: Purpose })
  @ApiProperty({
    example: '',
    required: true,
    description: 'Transaction purpose',
  })
  purpose: string;
  @Prop({
    required: true,
    default: 0,
    get: (value: number) => Number(value.toFixed(2)),
    set: (value: number) => Number(value.toFixed(2)),
  })
  @ApiProperty({
    example: 4000,
    required: true,
    description: 'Amount to tansfer purpose',
    minimum: 50,
    maximum: 10000000,
  })
  amount: number;

  // Many to One

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  @Type(() => User)
  userId: User;
  @Prop({ required: true })
  reference: string;

  @Prop({ required: true })
  previousBalance: number;

  @Prop({ required: true })
  newBalance: number;
  @Prop({ ref: 'User' })
  fullNameTransactionEntity: string;

  @Prop({ required: true })
  description: string;
  // tier
  @ValidateIf((s) => typeof s.status !== 'undefined')
  @IsIn(Object.values(Status))
  status: Status;
  // currency with it enum
}

export const TransactionSchema = SchemaFactory.createForClass(Transactions);
