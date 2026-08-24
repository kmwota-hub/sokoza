import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 80);
}

@Injectable()
export class BusinessesService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateBusinessDto) {
    let slug = slugify(dto.businessName);
    const existing = await this.prisma.business.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    return this.prisma.business.create({
      data: {
        ...dto,
        slug,
        ownerId,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });
  }

  async findAll(query?: string) {
    return this.prisma.business.findMany({
      where: {
        businessStatus: 'ACTIVE',
        ...(query ? {
          OR: [
            { businessName: { contains: query, mode: 'insensitive' } },
            { area: { contains: query, mode: 'insensitive' } },
          ],
        } : {}),
      },
      select: {
        id: true, businessName: true, slug: true, description: true,
        logo: true, coverImage: true, address: true, area: true,
        latitude: true, longitude: true, deliveryMode: true,
        _count: { select: { products: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const business = await this.prisma.business.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true, reviews: true } },
      },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async update(businessId: string, ownerId: string, dto: UpdateBusinessDto) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== ownerId) throw new ForbiddenException('Not your business');
    return this.prisma.business.update({ where: { id: businessId }, data: dto });
  }

  async getProducts(businessId: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');
    return this.prisma.product.findMany({
      where: { businessId, status: 'ACTIVE' },
      include: { images: true, inventory: true, category: true },
    });
  }

  async addMember(businessId: string, ownerId: string, userId: string, role: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== ownerId) throw new ForbiddenException('Not your business');

    const existing = await this.prisma.businessMember.findUnique({
      where: { businessId_userId: { businessId, userId } },
    });
    if (existing) throw new ConflictException('User is already a member');

    return this.prisma.businessMember.create({
      data: { businessId, userId, role: role as any },
    });
  }

  async removeMember(businessId: string, ownerId: string, userId: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== ownerId) throw new ForbiddenException('Not your business');
    await this.prisma.businessMember.delete({
      where: { businessId_userId: { businessId, userId } },
    });
    return { message: 'Member removed' };
  }
}