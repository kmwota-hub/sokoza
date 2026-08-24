import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  getCart(@CurrentUser() user: any) {
    return this.cartService.getCart(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(@CurrentUser() user: any, @Body() dto: AddItemDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Patch('items/:productId')
  @ApiOperation({ summary: 'Update item quantity' })
  updateItem(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItem(user.id, productId, quantity);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@CurrentUser() user: any, @Param('productId') productId: string) {
    return this.cartService.removeItem(user.id, productId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire cart' })
  clearCart(@CurrentUser() user: any) {
    return this.cartService.clearCart(user.id);
  }
}