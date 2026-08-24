import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BusinessStatus, RoleName } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listStores() {
    return this.prisma.business.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStoreStatus(id: string, status: BusinessStatus) {
    const store = await this.prisma.business.findUnique({ where: { id } });
    if (!store) throw new NotFoundException('Store not found');

    return this.prisma.business.update({
      where: { id },
      data: { businessStatus: status },
    });
  }

  async listUsers() {
    return this.prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, roleName: RoleName) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Find the role in DB
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new NotFoundException(`Role ${roleName} not found`);

    // Check if user already has this role
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    if (existingUserRole) {
      return { message: 'User already has this role' };
    }

    // Assign the role
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
      },
    });

    return { message: `Role ${roleName} successfully assigned to user` };
  }

  async listDeliveries() {
    return this.prisma.delivery.findMany({
      include: {
        order: true,
        rider: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
