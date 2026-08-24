import {
  Controller, Get, Post, Patch, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrderStatus } from '@prisma/client';

@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place an order from cart' })
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List customer orders' })
  findAll(@CurrentUser() user: any) {
    return this.ordersService.getCustomerOrders(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.getOrderDetail(id, user.id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (business owner/staff)' })
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(id, user.id, status);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order (customer only, pre-confirm)' })
  cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(id, user.id);
  }
}