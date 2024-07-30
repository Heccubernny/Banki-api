import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateMessagingDto,
  ErrorMessagingDto,
} from './dto/create-messaging.dto';
import { UpdateMessagingDto } from './dto/update-messaging.dto';
import { MessagingService } from './messaging.service';

@ApiBearerAuth()
@ApiTags('Messaging')
// Bad request response example
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  type: ErrorMessagingDto,
  description: 'Bad Request',
})
@Controller('api/v1/messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}
  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateMessagingDto,
  })
  create(@Body() createMessagingDto: CreateMessagingDto) {
    return this.messagingService.create(createMessagingDto);
  }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateMessagingDto,
  })
  findAll() {
    return this.messagingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagingService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessagingDto: UpdateMessagingDto,
  ) {
    return this.messagingService.update(+id, updateMessagingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagingService.remove(+id);
  }
}
