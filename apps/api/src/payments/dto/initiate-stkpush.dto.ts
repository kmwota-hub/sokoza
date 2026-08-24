import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiateStkPushDto {
  @ApiProperty() @IsUUID()
  orderId: string;

  @ApiProperty({ example: '254712345678' }) @IsString()
  phone: string;
}