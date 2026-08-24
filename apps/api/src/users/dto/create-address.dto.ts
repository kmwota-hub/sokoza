import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAddressDto {
  @ApiProperty({ example: 'Home' }) @IsString()
  label: string;

  @ApiProperty({ example: 'Juja Farm Road, House 12' }) @IsString()
  addressLine: string;

  @ApiProperty({ example: 'Juja' }) @IsString()
  area: string;

  @ApiPropertyOptional({ example: 'Sunrise Apartments' }) @IsOptional() @IsString()
  building?: string;

  @ApiProperty({ example: -1.1026 }) @Type(() => Number) @IsNumber()
  latitude: number;

  @ApiProperty({ example: 37.0132 }) @Type(() => Number) @IsNumber()
  longitude: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  instructions?: string;

  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean()
  isDefault?: boolean;
}