import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TrailsService } from './trails.service';
import { SearchTrailDto, NearbyTrailDto } from './dto/search-trail.dto';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@ApiTags('Trails')
@Controller('trails')
export class TrailsController {
  constructor(private readonly trailsService: TrailsService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('search')
  @ApiOperation({ summary: 'Search trails with multifaceted filters and pagination' })
  @ApiResponse({ status: 200, description: 'Matched trails list' })
  async searchTrails(@Query() searchDto: SearchTrailDto) {
    return this.trailsService.searchTrails(searchDto);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('nearby')
  @ApiOperation({ summary: 'Find trails nearby geospatial coordinates (2dsphere)' })
  @ApiResponse({ status: 200, description: 'Nearby trails with distance calculations' })
  async getNearbyTrails(@Query() nearbyDto: NearbyTrailDto) {
    return this.trailsService.getNearbyTrails(nearbyDto);
  }

  @Public()
  @Get('filter-options')
  @ApiOperation({ summary: 'Get available filter options (regions, terrains, tags)' })
  @ApiResponse({ status: 200, description: 'Available filter values' })
  async getFilterOptions() {
    return this.trailsService.getFilterOptions();
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get top-rated featured trails' })
  @ApiResponse({ status: 200, description: 'Featured trails' })
  async getFeaturedTrails() {
    return this.trailsService.getFeaturedTrails();
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get detailed trail information with waypoints & elevation profile' })
  @ApiResponse({ status: 200, description: 'Trail details' })
  async getTrailById(@Param('idOrSlug') idOrSlug: string) {
    return this.trailsService.getTrailById(idOrSlug);
  }
}
