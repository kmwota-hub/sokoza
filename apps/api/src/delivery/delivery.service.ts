import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DeliveryRequestStatus, DeliveryStatus, OrderStatus } from '@prisma/client';
import { DELIVERY_CONFIG } from '@sokoza/config';
import { NotificationsService } from '../notifications/notifications.service';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

@Injectable()
export class DeliveryService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createDeliveryForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: true,
        address: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    // Check if delivery already exists
    const existing = await this.prisma.delivery.findUnique({ where: { orderId } });
    if (existing) return existing;

    const pickupLat = Number(order.business.latitude);
    const pickupLng = Number(order.business.longitude);
    const deliveryLat = Number(order.address.latitude);
    const deliveryLng = Number(order.address.longitude);

    const distance = calculateDistance(pickupLat, pickupLng, deliveryLat, deliveryLng);
    const deliveryFee = DELIVERY_CONFIG.defaultFeeBase + (DELIVERY_CONFIG.feePerKm * distance);

    const delivery = await this.prisma.delivery.create({
      data: {
        orderId,
        pickupAddress: order.business.address,
        pickupLatitude: pickupLat,
        pickupLongitude: pickupLng,
        deliveryAddress: order.address.addressLine,
        deliveryLatitude: deliveryLat,
        deliveryLongitude: deliveryLng,
        deliveryFee,
        status: DeliveryStatus.PENDING,
      },
    });

    return delivery;
  }

  async startDispatch(deliveryId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: { include: { business: true } } },
    });
    if (!delivery) throw new NotFoundException('Delivery not found');

    // Update status to searching
    await this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: DeliveryStatus.SEARCHING_RIDER, requestedAt: new Date() },
    });

    // Find all online riders
    const onlineRiders = await this.prisma.rider.findMany({
      where: {
        availabilityStatus: 'ONLINE',
        verificationStatus: 'VERIFIED',
      },
    });

    if (onlineRiders.length === 0) {
      // No online riders found
      return { message: 'No online riders found. Waiting for riders to log in.' };
    }

    const business = delivery.order.business;
    const bLat = Number(business.latitude);
    const bLng = Number(business.longitude);

    // Filter and sort riders by distance
    const candidateRiders = onlineRiders
      .map((rider) => {
        const rLat = rider.currentLatitude ? Number(rider.currentLatitude) : bLat;
        const rLng = rider.currentLongitude ? Number(rider.currentLongitude) : bLng;
        const dist = calculateDistance(rLat, rLng, bLat, bLng);
        return { rider, dist };
      })
      .filter((candidate) => candidate.dist <= Number(candidate.rider.deliveryRadius))
      .sort((a, b) => a.dist - b.dist);

    if (candidateRiders.length === 0) {
      return { message: 'No riders within delivery radius.' };
    }

    const bestCandidate = candidateRiders[0];

    // Create a delivery request for the nearest rider
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + DELIVERY_CONFIG.riderAcceptTimeoutSeconds);

    const request = await this.prisma.deliveryRequest.create({
      data: {
        deliveryId,
        businessId: business.id,
        riderId: bestCandidate.rider.id,
        distance: bestCandidate.dist,
        offeredFee: delivery.deliveryFee,
        expiresAt,
        status: DeliveryRequestStatus.PENDING,
      },
    });

    // Notify Rider (Create Notification)
    await this.prisma.notification.create({
      data: {
        userId: bestCandidate.rider.userId,
        type: 'DELIVERY_DISPATCH',
        title: 'New Delivery Job Offered',
        message: `Delivery offered from ${business.businessName}. Fee: KSh ${delivery.deliveryFee.toFixed(0)}`,
        data: { deliveryId, requestId: request.id },
      },
    });

    return request;
  }

  async respondToRequest(riderUserId: string, requestId: string, accept: boolean) {
    const rider = await this.prisma.rider.findUnique({ where: { userId: riderUserId } });
    if (!rider) throw new NotFoundException('Rider profile not found');

    const request = await this.prisma.deliveryRequest.findUnique({
      where: { id: requestId },
      include: { delivery: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.riderId !== rider.id) throw new ForbiddenException('Not assigned to you');
    if (request.status !== DeliveryRequestStatus.PENDING) {
      throw new BadRequestException('Request already processed or expired');
    }

    if (accept) {
      // Transaction: Accept request, update delivery status, set riderId
      await this.prisma.$transaction(async (tx) => {
        await tx.deliveryRequest.update({
          where: { id: requestId },
          data: { status: DeliveryRequestStatus.ACCEPTED, respondedAt: new Date() },
        });

        await tx.delivery.update({
          where: { id: request.deliveryId },
          data: {
            status: DeliveryStatus.RIDER_ACCEPTED,
            riderId: rider.id,
            acceptedAt: new Date(),
          },
        });

        // Update Order to PREPARING
        await tx.order.update({
          where: { id: request.delivery.orderId },
          data: { orderStatus: OrderStatus.PREPARING },
        });

        // Reject other requests for this delivery
        await tx.deliveryRequest.updateMany({
          where: {
            deliveryId: request.deliveryId,
            id: { not: requestId },
            status: DeliveryRequestStatus.PENDING,
          },
          data: { status: DeliveryRequestStatus.CANCELLED },
        });
      });

      // Send push notification asynchronously
      this.notificationsService.sendOrderUpdate(request.delivery.orderId, 'PREPARING')
        .catch((e) => console.error('Failed to send PREPARING notification:', e));

      return { success: true, message: 'Delivery offer accepted' };
    } else {
      // Reject request
      await this.prisma.deliveryRequest.update({
        where: { id: requestId },
        data: { status: DeliveryRequestStatus.REJECTED, respondedAt: new Date() },
      });

      // Find next rider
      await this.startDispatch(request.deliveryId);

      return { success: true, message: 'Delivery offer rejected' };
    }
  }

  async getActiveDelivery(userId: string) {
    // Return any active delivery where user is customer, merchant, or rider
    return this.prisma.delivery.findFirst({
      where: {
        status: {
          in: [
            DeliveryStatus.PENDING,
            DeliveryStatus.SEARCHING_RIDER,
            DeliveryStatus.RIDER_ASSIGNED,
            DeliveryStatus.RIDER_ACCEPTED,
            DeliveryStatus.ARRIVED_AT_PICKUP,
            DeliveryStatus.PICKED_UP,
            DeliveryStatus.IN_TRANSIT,
            DeliveryStatus.ARRIVED_AT_DESTINATION,
          ],
        },
        OR: [
          { order: { customerId: userId } },
          { order: { business: { ownerId: userId } } },
          { rider: { userId } },
        ],
      },
      include: {
        order: {
          include: {
            business: { select: { businessName: true, phone: true } },
            address: true,
          },
        },
        rider: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async updateDeliveryStatus(riderUserId: string, deliveryId: string, status: DeliveryStatus) {
    const rider = await this.prisma.rider.findUnique({ where: { userId: riderUserId } });
    if (!rider) throw new NotFoundException('Rider profile not found');

    const delivery = await this.prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.riderId !== rider.id) throw new ForbiddenException('Not assigned to this delivery');

    const updateData: any = { status };
    if (status === DeliveryStatus.PICKED_UP) {
      updateData.pickedUpAt = new Date();
    } else if (status === DeliveryStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const d = await tx.delivery.update({
        where: { id: deliveryId },
        data: updateData,
      });

      // Sync Order Status
      let orderStatus: OrderStatus = OrderStatus.PREPARING;
      if (status === DeliveryStatus.PICKED_UP) {
        orderStatus = OrderStatus.PICKED_UP;
      } else if (status === DeliveryStatus.DELIVERED) {
        orderStatus = OrderStatus.DELIVERED;
      }

      await tx.order.update({
        where: { id: delivery.orderId },
        data: { orderStatus },
      });

      // If delivered, update rider statistics
      if (status === DeliveryStatus.DELIVERED) {
        await tx.rider.update({
          where: { id: rider.id },
          data: { totalDeliveries: { increment: 1 } },
        });

        // Trigger payout creation
        const commission = Number(delivery.deliveryFee) * 0.8; // 80% to rider
        await tx.payout.create({
          data: {
            riderId: rider.id,
            amount: commission,
            status: 'PENDING',
          },
        });
      }

      return d;
    });

    // Send push notification asynchronously
    let orderStatus: OrderStatus | null = null;
    if (status === DeliveryStatus.PICKED_UP) {
      orderStatus = OrderStatus.PICKED_UP;
    } else if (status === DeliveryStatus.DELIVERED) {
      orderStatus = OrderStatus.DELIVERED;
    }
    if (orderStatus) {
      this.notificationsService.sendOrderUpdate(delivery.orderId, orderStatus)
        .catch((e) => console.error(`Failed to send ${orderStatus} notification:`, e));
    }

    return updated;
  }
}