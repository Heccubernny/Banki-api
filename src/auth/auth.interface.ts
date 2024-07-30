import { Request } from 'express';
import { UserDocument } from 'src/user/entities/user.entity';

export interface RequestWithUser extends Request {
  user: UserDocument;
}
