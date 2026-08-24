import { IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddItemDto {
  @ApiProperty() @IsUUID()
  productId: string;

  @ApiProperty({ example: 2 }) @Type(() => Number) @IsNumber() @Min(1)
  quantity: number;
}