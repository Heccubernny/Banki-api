import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { TrnxType } from '../entities/transaction.entity';

@Injectable()
export class TransactionTypeValidationPipe implements PipeTransform {
  transform(value: any, meta: ArgumentMetadata) {
    if (!(value.trnxType in TrnxType)) {
      throw new BadRequestException(
        `${value.trnxType} is not a valid transaction type`,
      );
    }
    return value;
  }
}
