import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRiderDto {
  @ApiProperty({ example: 'Boda Boda' }) @IsString()
  vehicleType: string;

  @ApiProperty({ example: 'KBZ 123A' }) @IsString()
  vehicleRegistration: string;

  @ApiProperty({ example: '+254712345678' }) @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 15 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(50)
  deliveryRadius?: number;
}