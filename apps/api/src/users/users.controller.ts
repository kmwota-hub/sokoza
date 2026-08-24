import {
  Controller, Get, Patch, Post, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/profile')
  @ApiOperation({ summary: 'Get own profile' })
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update own profile' })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me/addresses')
  @ApiOperation({ summary: 'List saved addresses' })
  getAddresses(@CurrentUser() user: any) {
    return this.usersService.getAddresses(user.id);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: 'Add a new address' })
  createAddress(@CurrentUser() user: any, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(user.id, dto);
  }

  @Patch('me/addresses/:id')
  @ApiOperation({ summary: 'Update an address' })
  updateAddress(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateAddressDto) {
    return this.usersService.updateAddress(user.id, id, dto);
  }

  @Delete('me/addresses/:id')
  @ApiOperation({ summary: 'Delete an address' })
  deleteAddress(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.deleteAddress(user.id, id);
  }
}