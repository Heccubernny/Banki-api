import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Type } from 'class-transformer';
import { Max, MaxLength, Min } from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { Payment } from 'src/payment/entities/payment.entity';
import { Transactions } from 'src/transaction/entities/transaction.entity';
import { Token, TokenSchema } from './token.entity';

export type UserDocument = HydratedDocument<User>;

// @modelOptions({
//   schemaOptions: {
//     timestamps: { createdAt: 'created', updatedAt: 'updated' },
//     collection: 'user',
//     toObject: { virtuals: true },
//   },
// })
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
  // @Exclude()
  password: string;

  @Prop({ required: true, default: '0000' })
  @Exclude()
  pin: string;
  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ required: true, default: 0 })
  balance: string;

  // Many to many
  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Category.name })
  // @Type(() => Category)
  // categories: Category;
  @Prop()
  isActive: boolean;
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Transactions' })
  transactions: Transactions[];
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
