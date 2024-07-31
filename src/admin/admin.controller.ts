import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionService } from '../transaction/transaction.service';
import { AdminService } from './admin.service';

@ApiBearerAuth()
@ApiTags('Admin')
@Controller('api/v1/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly transactionService: TransactionService,
  ) {}

  @Get(':accountNumber')
  getCustomerDetail(@Param('accountNumber') accountNumber: string) {
    return this.transactionService.getCustomerDetails(accountNumber);
  }
}
