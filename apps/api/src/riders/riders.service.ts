import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class RidersService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, dto: CreateRiderDto) {
    const existing = await this.prisma.rider.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Rider profile already exists');

    return this.prisma.rider.create({
      data: { ...dto, userId },
    });
  }

  async getMyProfile(userId: string) {
    const rider = await this.prisma.rider.findUnique({
      where: { userId },
      include: { documents: true, availability: true },
    });
    if (!rider) throw new NotFoundException('Rider profile not found. Please register first.');
    return rider;
  }

  async update(userId: string, dto: Partial<CreateRiderDto>) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');
    return this.prisma.rider.update({ where: { userId }, data: dto });
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');
    return this.prisma.rider.update({
      where: { userId },
      data: {
        availabilityStatus: dto.status,
        ...(dto.latitude ? { currentLatitude: dto.latitude } : {}),
        ...(dto.longitude ? { currentLongitude: dto.longitude } : {}),
      },
    });
  }

  async addDocument(userId: string, doc: {
    documentType: string;
    documentNumber: string;
    documentUrl: string;
  }) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');
    return this.prisma.riderDocument.create({
      data: { riderId: rider.id, ...doc as any },
    });
  }

  async getDeliveries(userId: string) {
    const rider = await this.prisma.rider.findUnique({ where: { userId } });
    if (!rider) throw new NotFoundException('Rider profile not found');
    return this.prisma.delivery.findMany({
      where: { riderId: rider.id },
      include: { order: { include: { business: { select: { businessName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}