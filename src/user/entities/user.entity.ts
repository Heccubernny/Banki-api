import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Type } from 'class-transformer';
import { Max, MaxLength, Min } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { Payment } from 'src/payment/entities/payment.entity';
import { OneToMany } from 'typeorm';
import { Transactions } from '../../transaction/entities/transaction.entity';
import { Token, TokenSchema } from './token.entity';
export type UserDocument = HydratedDocument<User>;

// @modelOptions({
//   schemaOptions: {
//     timestamps: { createdAt: 'created', updatedAt: 'updated' },
//     collection: 'user',
//     toObject: { virtuals: true },
//   },
// })

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}
@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  firstName: string;
  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, trim: true, unique: true })
  email: string;

  @Prop({ required: true, trim: true, unique: true })
  @MaxLength(11)
  phoneNumber: string;

  @Prop({ required: true, unique: true, trim: true })
  @MaxLength(10)
  accountNumber: string;

  @Prop({ required: true })
  @Exclude()
  password: string;

  @Prop({ required: true, default: '0000' })
  @Exclude()
  pin: string;
  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: Role.USER, enum: Role })
  role: Role;

  @Prop({
    required: true,
    default: 0,
    get: (value: number) => Number(value.toFixed(2)),
    set: (value: number) => Number(value.toFixed(2)),
  })
  balance: number;

  // Many to many
  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name })
  // @Type(() => Category)
  // categories: Category;
  @Prop()
  isActive: boolean;
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Transactions' })
  @OneToMany(
    () => Transactions,
    (transaction: Transactions) => transaction.userId,
  )
  transactions: Transactions[];
  // transactions: mongoose.Schema.Types.ObjectId[];
  @Prop()
  payment: Payment[];
  @Prop()
  notification: Notification[];

  // one to one
  @Prop({ type: TokenSchema })
  @Type(() => Token)
  token: Token;
  // kyc level

  @Min(1)
  @Max(3)
  @Prop({ default: 1 })
  tier: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
