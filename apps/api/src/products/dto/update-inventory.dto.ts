import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateInventoryDto {
  @ApiProperty({ example: 50 }) @Type(() => Number) @IsNumber() @Min(0)
  quantity: number;

  @ApiProperty({ example: 5 }) @Type(() => Number) @IsNumber() @Min(0)
  lowStockThreshold: number;
}