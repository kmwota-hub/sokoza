import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { delivery: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId !== userId) {
      throw new ForbiddenException('You can only review your own orders');
    }

    if (order.orderStatus !== OrderStatus.DELIVERED) {
      throw new BadRequestException('You can only review delivered orders');
    }

    // Check if review already exists
    const existingReview = await this.prisma.review.findFirst({
      where: {
        customerId: userId,
        orderId: dto.orderId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this order');
    }

    // Determine riderId if not provided but exists in delivery
    let riderId = dto.riderId;
    if (!riderId && order.delivery && order.delivery.riderId) {
      riderId = order.delivery.riderId;
    }

    // Create the review
    const review = await this.prisma.review.create({
      data: {
        customerId: userId,
        orderId: dto.orderId,
        businessId: dto.businessId,
        riderId: riderId || null,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        business: true,
        rider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    // Optionally update business and rider average ratings
    await this.updateBusinessRating(dto.businessId);
    if (riderId) {
      await this.updateRiderRating(riderId);
    }

    return review;
  }

  async findByBusiness(businessId: string) {
    return this.prisma.review.findMany({
      where: { businessId },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByRider(riderId: string) {
    return this.prisma.review.findMany({
      where: { riderId },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async updateBusinessRating(businessId: string) {
    // Note: Business model does not currently store a rating field in schema.
    // If it did, we would update it here. For now, it is calculated on the fly.
  }

  private async updateRiderRating(riderId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { riderId },
      select: { rating: true },
    });

    if (reviews.length === 0) return;

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / reviews.length;

    await this.prisma.rider.update({
      where: { id: riderId },
      data: { rating: avg },
    });
  }
}
