import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleName } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+254712345678' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ example: 'StrongPass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiPropertyOptional({ enum: [RoleName.CUSTOMER, RoleName.BUSINESS_OWNER, RoleName.RIDER], default: RoleName.CUSTOMER })
  @IsOptional()
  @IsEnum([RoleName.CUSTOMER, RoleName.BUSINESS_OWNER, RoleName.RIDER])
  role?: RoleName;
}