import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@CurrentUser('userId') userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, refreshTokenHash, ...result } = user.toObject();
    return result;
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateDto);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user hiking preferences' })
  @ApiResponse({ status: 200, description: 'Preferences retrieved successfully' })
  async getPreferences(@CurrentUser('userId') userId: string) {
    return this.usersService.getPreferences(userId);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user hiking preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(
    @CurrentUser('userId') userId: string,
    @Body() updates: Record<string, any>,
  ) {
    return this.usersService.updatePreferences(userId, updates);
  }
}
