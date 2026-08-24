import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AddItemDto } from './dto/add-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const carts = await this.prisma.cart.findMany({
      where: { userId },
      include: {
        business: { select: { id: true, businessName: true, slug: true, logo: true } },
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
          },
        },
      },
    });
    return carts;
  }

  async addItem(userId: string, dto: AddItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { inventory: true },
    });
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not available');
    }
    if (product.inventory && product.inventory.quantity < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Get or create cart for this business
    let cart = await this.prisma.cart.findUnique({
      where: { userId_businessId: { userId, businessId: product.businessId } },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, businessId: product.businessId },
      });
    }

    const unitPrice = product.discountPrice ?? product.price;

    // Upsert cart item
    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId: dto.productId } },
        data: { quantity: existing.quantity + dto.quantity },
      });
    }

    return this.prisma.cartItem.create({
      data: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity, unitPrice },
    });
  }

  async updateItem(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) return this.removeItem(userId, productId);

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const cart = await this.prisma.cart.findUnique({
      where: { userId_businessId: { userId, businessId: product.businessId } },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    return this.prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    });
  }

  async removeItem(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const cart = await this.prisma.cart.findUnique({
      where: { userId_businessId: { userId, businessId: product.businessId } },
    });
    if (!cart) throw new NotFoundException('Cart not found');

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    return { message: 'Item removed' };
  }

  async clearCart(userId: string) {
    const carts = await this.prisma.cart.findMany({ where: { userId } });
    for (const cart of carts) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { message: 'Cart cleared' };
  }
}