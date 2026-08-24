import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RegisterDeviceTokenDto } from './dto/register-token.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('token')
  @ApiOperation({ summary: 'Register device token for push notifications' })
  registerToken(@CurrentUser() user: any, @Body() dto: RegisterDeviceTokenDto) {
    return this.notificationsService.registerToken(user.id, dto.token, dto.platform);
  }

  @Get()
  @ApiOperation({ summary: 'List user notifications' })
  findAll(@CurrentUser() user: any) {
    return this.notificationsService.getUserNotifications(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.markRead(user.id, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllRead(user.id);
  }
}