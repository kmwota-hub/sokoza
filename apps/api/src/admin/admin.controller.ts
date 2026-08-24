import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName, BusinessStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class UpdateStoreStatusDto {
  @ApiProperty({ enum: BusinessStatus })
  @IsEnum(BusinessStatus)
  status: BusinessStatus;
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: RoleName })
  @IsEnum(RoleName)
  role: RoleName;
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stores')
  @ApiOperation({ summary: 'List all businesses (Admin only)' })
  listStores() {
    return this.adminService.listStores();
  }

  @Patch('stores/:id/status')
  @ApiOperation({ summary: 'Update business status (Admin only)' })
  updateStoreStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStoreStatusDto,
  ) {
    return this.adminService.updateStoreStatus(id, dto.status);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users with roles (Admin only)' })
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Assign a role to a user (Admin only)' })
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto.role);
  }

  @Get('deliveries')
  @ApiOperation({ summary: 'List all deliveries (Admin only)' })
  listDeliveries() {
    return this.adminService.listDeliveries();
  }
}
