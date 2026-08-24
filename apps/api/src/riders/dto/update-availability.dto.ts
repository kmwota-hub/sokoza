import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiderAvailabilityStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateAvailabilityDto {
  @ApiProperty({ enum: RiderAvailabilityStatus })
  @IsEnum(RiderAvailabilityStatus)
  status: RiderAvailabilityStatus;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  latitude?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  longitude?: number;
}