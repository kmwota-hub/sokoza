import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 80);
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProductDto) {
    // Verify user owns or manages this business
    const member = await this.prisma.businessMember.findUnique({
      where: { businessId_userId: { businessId: dto.businessId, userId } },
    });
    const business = await this.prisma.business.findUnique({ where: { id: dto.businessId } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== userId && !member) {
      throw new ForbiddenException('Not authorized for this business');
    }

    const slug = slugify(dto.name);
    const { quantity, ...productData } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        slug,
        price: dto.price,
        discountPrice: dto.discountPrice,
        inventory: quantity !== undefined ? {
          create: { quantity, lowStockThreshold: 5 },
        } : undefined,
      },
      include: { images: true, inventory: true, category: true },
    });
    return product;
  }

  async findAll(query?: string, categoryId?: string, businessId?: string) {
    return this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(businessId ? { businessId } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(query ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: {
        images: { take: 1 },
        inventory: true,
        business: { select: { businessName: true, slug: true, area: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true, inventory: true, category: true, business: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, userId: string, dto: any) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: { business: true } });
    if (!product) throw new NotFoundException('Product not found');

    const isOwner = product.business.ownerId === userId;
    const isMember = await this.prisma.businessMember.findUnique({
      where: { businessId_userId: { businessId: product.businessId, userId } },
    });
    if (!isOwner && !isMember) throw new ForbiddenException('Not authorized');

    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async deactivate(id: string, userId: string) {
    return this.update(id, userId, { status: 'INACTIVE' as any });
  }

  async updateInventory(productId: string, userId: string, dto: UpdateInventoryDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, include: { business: true } });
    if (!product) throw new NotFoundException('Product not found');

    const isOwner = product.business.ownerId === userId;
    const isMember = await this.prisma.businessMember.findUnique({
      where: { businessId_userId: { businessId: product.businessId, userId } },
    });
    if (!isOwner && !isMember) throw new ForbiddenException('Not authorized');

    return this.prisma.inventory.upsert({
      where: { productId },
      update: dto,
      create: { productId, ...dto },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      where: { status: 'ACTIVE' },
      include: { children: true },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: { name: string; description?: string; image?: string; parentId?: string }) {
    const slug = slugify(data.name);
    return this.prisma.category.create({ data: { ...data, slug } });
  }
}