import { Document } from 'mongoose';
import { User } from './entities/user.entity';

export interface UserInterface extends Document<User> {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly accountNumber: string;
}
