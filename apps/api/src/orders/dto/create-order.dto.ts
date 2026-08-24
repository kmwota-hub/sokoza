import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Business to order from' }) @IsUUID()
  businessId: string;

  @ApiProperty({ description: 'Delivery address ID' }) @IsUUID()
  deliveryAddressId: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  customerNotes?: string;
}