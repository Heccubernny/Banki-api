import { Transform, Type } from 'class-transformer';
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
  @Type(() => Number)
  @Transform(({ value }) => Number(value.toFixed(2)), { toClassOnly: true })
  amount: number;
  @IsString()
  @IsNotEmpty()
  // @ApiProperty()
  description: string;
}
