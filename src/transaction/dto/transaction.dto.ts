import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export class TransactionDto {
  // @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  recipient: string;
  // @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  sender: string;
  // @ApiProperty()
  @IsNumber()
  @Min(50)
  @Max(1000000)
  amount: number;
  @IsString()
  @IsNotEmpty()
  // @ApiProperty()
  description: string;
}
