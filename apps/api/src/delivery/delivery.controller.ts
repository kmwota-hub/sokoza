import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { RespondRequestDto } from './dto/respond-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DeliveryStatus } from '@prisma/client';

@ApiTags('delivery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get current user active delivery' })
  getActive(@CurrentUser() user: any) {
    return this.deliveryService.getActiveDelivery(user.id);
  }

  @Post('request/:id/respond')
  @ApiOperation({ summary: 'Accept or reject dispatch offer (Rider only)' })
  respond(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: RespondRequestDto,
  ) {
    return this.deliveryService.respondToRequest(
      user.id,
      id,
      dto.status === 'ACCEPTED',
    );
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update delivery status progress (Rider only)' })
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: DeliveryStatus,
  ) {
    return this.deliveryService.updateDeliveryStatus(user.id, id, status);
  }
}