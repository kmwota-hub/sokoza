import { IsString, IsOptional, IsEnum, MaxLength, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryMode } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Kamau General Store' }) @IsString() @MaxLength(120)
  businessName: string;

  @ApiProperty({ example: 'Your neighbourhood one-stop shop in Juja.' }) @IsString()
  description: string;

  @ApiProperty({ example: '+254712345678' }) @IsString()
  phone: string;

  @ApiProperty({ example: 'kamau@store.co.ke' }) @IsString()
  email: string;

  @ApiProperty({ example: 'Thika Road, Juja Town' }) @IsString()
  address: string;

  @ApiProperty({ example: 'Juja' }) @IsString()
  area: string;

  @ApiProperty({ example: -1.1026 }) @Type(() => Number) @IsNumber()
  latitude: number;

  @ApiProperty({ example: 37.0132 }) @Type(() => Number) @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ enum: DeliveryMode, default: DeliveryMode.BOTH })
  @IsOptional() @IsEnum(DeliveryMode)
  deliveryMode?: DeliveryMode;

  @ApiPropertyOptional() @IsOptional() @IsString()
  logo?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  coverImage?: string;
}