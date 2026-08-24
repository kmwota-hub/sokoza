import { IsString, IsNumber, IsOptional, IsEnum, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty() @IsUUID()
  businessId: string;

  @ApiProperty() @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Unga wa Ngano 2kg' }) @IsString()
  name: string;

  @ApiProperty() @IsString()
  description: string;

  @ApiProperty({ example: 180 }) @Type(() => Number) @IsNumber() @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 160 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  discountPrice?: number;

  @ApiProperty({ example: 'UNG-2KG-001' }) @IsString()
  sku: string;

  @ApiPropertyOptional({ example: 50 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  quantity?: number;
}