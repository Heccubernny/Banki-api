import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export class AddMoneyTransactionDto {
  // @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  receiver: string;
  // @ApiProperty()
  // Mode of funding the account
  //   @IsString()
  //   @IsNotEmpty()
  //   @MaxLength(10)
  //   transaction: string;
  // @ApiProperty()
  @IsNumber()
  @Min(50)
  @Max(1000000)
  amount: number;
  @IsString()
  @IsNotEmpty()
  // @ApiProperty()
  description?: string;
  @IsNotEmpty()
  @IsString()
  methodToUse: string;
}

export class AddMoneyResponseDto {
  trnxType: string;
  purpose: string;
  amount: number;
  userId: string;
  reference: string;
  previousBalance: number;
  newBalance: number;
  fullNameTransactionEntity: string;
  description: string;
  status: string;
}
