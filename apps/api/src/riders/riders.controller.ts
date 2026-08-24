import {
  Controller, Get, Post, Patch, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RidersService } from './riders.service';
import { CreateRiderDto } from './dto/create-rider.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('riders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('riders')
export class RidersController {
  constructor(private readonly ridersService: RidersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create rider profile' })
  register(@CurrentUser() user: any, @Body() dto: CreateRiderDto) {
    return this.ridersService.register(user.id, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get own rider profile' })
  getProfile(@CurrentUser() user: any) {
    return this.ridersService.getMyProfile(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update rider vehicle info' })
  update(@CurrentUser() user: any, @Body() dto: Partial<CreateRiderDto>) {
    return this.ridersService.update(user.id, dto);
  }

  @Patch('me/availability')
  @ApiOperation({ summary: 'Toggle rider availability (ONLINE / OFFLINE / BUSY)' })
  updateAvailability(@CurrentUser() user: any, @Body() dto: UpdateAvailabilityDto) {
    return this.ridersService.updateAvailability(user.id, dto);
  }

  @Post('me/documents')
  @ApiOperation({ summary: 'Upload verification document' })
  addDocument(@CurrentUser() user: any, @Body() doc: any) {
    return this.ridersService.addDocument(user.id, doc);
  }

  @Get('me/deliveries')
  @ApiOperation({ summary: 'List rider deliveries' })
  getDeliveries(@CurrentUser() user: any) {
    return this.ridersService.getDeliveries(user.id);
  }
}