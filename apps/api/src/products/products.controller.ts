import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  create(@CurrentUser() user: any, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search/list products' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'businessId', required: false })
  findAll(@Query('q') q?: string, @Query('categoryId') categoryId?: string, @Query('businessId') businessId?: string) {
    return this.productsService.findAll(q, categoryId, businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.productsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate product (soft delete)' })
  deactivate(@CurrentUser() user: any, @Param('id') id: string) {
    return this.productsService.deactivate(id, user.id);
  }

  @Patch(':id/inventory')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product stock' })
  updateInventory(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.productsService.updateInventory(id, user.id, dto);
  }
}

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  findAll() {
    return this.productsService.getCategories();
  }

  @Post()
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (admin)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.productsService.createCategory(dto);
  }
}