import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private generateOrderNumber(): string {
    const ts = Date.now().toString().slice(-8);
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `SKZ-${ts}-${rand}`;
  }

  async createOrder(customerId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId_businessId: { userId: customerId, businessId: dto.businessId } },
      include: {
        items: { include: { product: { include: { inventory: true } } } },
        business: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const address = await this.prisma.address.findUnique({
      where: { id: dto.deliveryAddressId },
    });
    if (!address || address.userId !== customerId) {
      throw new NotFoundException('Delivery address not found');
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.product.inventory && item.product.inventory.quantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${item.product.name}`);
      }
    }

    const subtotal = cart.items.reduce(
      (sum, i) => sum + Number(i.unitPrice) * i.quantity, 0,
    );
    const deliveryFee = 50; // default KES 50; will be dynamic in Phase 3
    const totalAmount = subtotal + deliveryFee;

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          customerId,
          businessId: dto.businessId,
          deliveryAddressId: dto.deliveryAddressId,
          subtotal,
          deliveryFee,
          totalAmount,
          customerNotes: dto.customerNotes,
          items: {
            create: cart.items.map((i) => ({
              productId: i.productId,
              productName: i.product.name,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              subtotal: Number(i.unitPrice) * i.quantity,
            })),
          },
        },
        include: { items: true, address: true },
      });

      // Reserve inventory
      for (const item of cart.items) {
        if (item.product.inventory) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { reservedQuantity: { increment: item.quantity } },
          });
        }
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  }

  async getCustomerOrders(customerId: string) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        business: { select: { businessName: true, slug: true, logo: true } },
        items: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderDetail(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: { select: { businessName: true, slug: true, logo: true, phone: true } },
        items: true,
        address: true,
        delivery: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== userId && order.businessId !== userId) {
      throw new ForbiddenException('Not your order');
    }
    return order;
  }

  async updateStatus(orderId: string, userId: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { business: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const isBusinessOwner = order.business.ownerId === userId;
    const isMember = await this.prisma.businessMember.findUnique({
      where: { businessId_userId: { businessId: order.businessId, userId } },
    });

    if (!isBusinessOwner && !isMember) {
      throw new ForbiddenException('Not authorized to update this order');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });

    // Send push notification asynchronously
    this.notificationsService.sendOrderUpdate(orderId, status)
      .catch((e) => console.error(`Failed to send ${status} order notification:`, e));

    return updated;
  }

  async cancelOrder(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId) throw new ForbiddenException('Not your order');
    if (!['PENDING', 'CONFIRMED'].includes(order.orderStatus)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: OrderStatus.CANCELLED },
    });

    // Send push notification asynchronously
    this.notificationsService.sendOrderUpdate(orderId, 'CANCELLED')
      .catch((e) => console.error('Failed to send CANCELLED order notification:', e));

    return updated;
  }
}