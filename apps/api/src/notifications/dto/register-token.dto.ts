import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDeviceTokenDto {
  @ApiProperty({ example: 'fcm-device-token-123456' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'web', enum: ['web', 'android', 'ios'] })
  @IsString()
  @IsNotEmpty()
  platform: string;
}
