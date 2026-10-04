import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { HikeStatus } from './schemas/saved-hike.schema';

@ApiTags('Favorites & Saved Hikes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('favorites/toggle/:trailId')
  @ApiOperation({ summary: 'Toggle trail in user favorites (login required)' })
  @ApiResponse({ status: 200, description: 'Favorite status toggled' })
  async toggleFavorite(
    @CurrentUser('userId') userId: string,
    @Param('trailId') trailId: string,
  ) {
    return this.favoritesService.toggleFavorite(userId, trailId);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get list of favorite trails for logged-in user' })
  @ApiResponse({ status: 200, description: 'List of favorite trails' })
  async getFavorites(@CurrentUser('userId') userId: string) {
    return this.favoritesService.getFavorites(userId);
  }

  @Get('favorites/status/:trailId')
  @ApiOperation({ summary: 'Check if a trail is favorited by current user' })
  @ApiResponse({ status: 200, description: 'Favorite status' })
  async isFavorite(
    @CurrentUser('userId') userId: string,
    @Param('trailId') trailId: string,
  ) {
    const isFav = await this.favoritesService.isFavorite(userId, trailId);
    return { isFavorite: isFav };
  }

  @Post('saved-hikes')
  @ApiOperation({ summary: 'Save hike / add to planned trips or wishlist' })
  @ApiResponse({ status: 201, description: 'Hike saved' })
  async saveHike(
    @CurrentUser('userId') userId: string,
    @Body() body: { trailIdOrSlug: string; status?: HikeStatus; scheduledDate?: string; notes?: string },
  ) {
    return this.favoritesService.saveHike(userId, body);
  }

  @Get('saved-hikes')
  @ApiOperation({ summary: 'Get saved/planned hikes' })
  @ApiQuery({ name: 'status', enum: HikeStatus, required: false })
  @ApiResponse({ status: 200, description: 'List of saved hikes' })
  async getSavedHikes(
    @CurrentUser('userId') userId: string,
    @Query('status') status?: HikeStatus,
  ) {
    return this.favoritesService.getSavedHikes(userId, status);
  }

  @Delete('saved-hikes/:id')
  @ApiOperation({ summary: 'Delete a saved hike' })
  @ApiResponse({ status: 200, description: 'Hike removed' })
  async removeSavedHike(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.favoritesService.removeSavedHike(userId, id);
  }
}
