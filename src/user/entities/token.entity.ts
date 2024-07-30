import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { User } from './user.entity';

export class Token {
  _id: Types.ObjectId;
  @Prop()
  token: string;
  @Prop()
  refreshToken: string;
  @Prop()
  isValid: string;

  @Prop({ default: Date.now })
  createdAt: Date;
  @Prop()
  // Date + 1h
  expiredAt: Date;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Token' })
  userId: User;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
// export const TokenSchema = new mongoose.Schema({
//   token: String,
//   refreshToken: String,
//   createdAt: String,
//   expiredAt: String,
//   isValid: Boolean,
//   userId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
// });
