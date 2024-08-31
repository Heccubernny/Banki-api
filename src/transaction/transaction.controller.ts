import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  // UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  // ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request, Response } from 'express';
import { AddMoneyTransactionDto } from './dto/add-money-transaction.dto';
import { TransactionDto } from './dto/transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transactions } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';

// @ApiBearerAuth()
@ApiTags('Transaction')
@Controller('api/v1/transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: "Create Transaction's api" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Deposit to your account',
    type: Transactions,
  })
  @UsePipes(ValidationPipe)
  // @UseGuards(JwtAuthGuard)
  fund(@Body() addMoneyTransactionDto: AddMoneyTransactionDto) {
    return this.transactionService.addMoney(addMoneyTransactionDto);
  }

  @Post('/transfer')
  @UsePipes(ValidationPipe)
  // @UsePipes(new TransactionTypeValidationPipe())
  transferToBanki(@Body() transactionDto: TransactionDto) {
    return this.transactionService.transferToBanki(transactionDto);
  }

  // this specific code can be for admin. but later i will remodify it to only show the authUser their own balance when i implement the jwt token.
  @Get(':accountNumber/balance')
  availableBalance(@Param('accountNumber') accountNumber: string) {
    return this.transactionService.availableBalance({ accountNumber });
  }

  @Get('/all')
  async getAllUserTransactions(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    response.header('Access-control-Allow-Origin', '*');
    return await this.transactionService.getAllUserTransactions();
  }

  @Get('')
  getUsersTransactionsByType(@Query('trnxType') trnxType: string) {
    return this.transactionService.getUsersTransactionsByType(trnxType);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(+id);
  }

  @Get('total_wallet_funding')
  getTotalWalletFunding(@Req() request: Request, @Res() response: Response) {
    response.header('Access-control-Allow-Origin', '*');
    return this.transactionService.getTotalNumberOfWalletFunding();
  }
}
