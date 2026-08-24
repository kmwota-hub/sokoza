import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: { ...dto, userId, latitude: dto.latitude, longitude: dto.longitude },
    });
  }

  async updateAddress(userId: string, addressId: string, dto: Partial<CreateAddressDto>) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException('Not your address');

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({ where: { id: addressId }, data: dto });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException('Not your address');
    await this.prisma.address.delete({ where: { id: addressId } });
    return { message: 'Address deleted' };
  }
}