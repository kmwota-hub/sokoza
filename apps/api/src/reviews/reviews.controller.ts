import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a new review/rating for an order' })
  create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all reviews for a specific business' })
  getByBusiness(@Param('businessId') businessId: string) {
    return this.reviewsService.findByBusiness(businessId);
  }

  @Get('rider/:riderId')
  @ApiOperation({ summary: 'Get all reviews for a specific rider' })
  getByRider(@Param('riderId') riderId: string) {
    return this.reviewsService.findByRider(riderId);
  }
}
