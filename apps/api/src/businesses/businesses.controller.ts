import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new business' })
  create(@CurrentUser() user: any, @Body() dto: CreateBusinessDto) {
    return this.businessesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Browse active businesses' })
  @ApiQuery({ name: 'q', required: false })
  findAll(@Query('q') q?: string) {
    return this.businessesService.findAll(q);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get business by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.businessesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update business info (owner only)' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateBusinessDto) {
    return this.businessesService.update(id, user.id, dto);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'List products for a business' })
  getProducts(@Param('id') id: string) {
    return this.businessesService.getProducts(id);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a staff member to business' })
  addMember(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('role') role: string,
  ) {
    return this.businessesService.addMember(id, user.id, userId, role);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a staff member from business' })
  removeMember(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.businessesService.removeMember(id, user.id, userId);
  }
}