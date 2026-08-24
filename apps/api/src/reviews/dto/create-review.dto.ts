import { IsUUID, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty()
  @IsUUID()
  businessId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  riderId?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
