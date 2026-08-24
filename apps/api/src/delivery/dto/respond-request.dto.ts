import { IsEnum } from 'class-validator';
import { DeliveryRequestStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RespondRequestDto {
  @ApiProperty({ enum: [DeliveryRequestStatus.ACCEPTED, DeliveryRequestStatus.REJECTED] })
  @IsEnum([DeliveryRequestStatus.ACCEPTED, DeliveryRequestStatus.REJECTED])
  status: DeliveryRequestStatus;
}