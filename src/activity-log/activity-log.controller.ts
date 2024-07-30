import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';

@ApiBearerAuth()
@ApiTags('ActivityLog')
@Controller('/api/v1/activity-log')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogService.create(createActivityLogDto);
  }

  @Get()
  findAll() {
    return this.activityLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityLogService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateActivityLogDto: UpdateActivityLogDto,
  ) {
    return this.activityLogService.update(+id, updateActivityLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityLogService.remove(+id);
  }
}
