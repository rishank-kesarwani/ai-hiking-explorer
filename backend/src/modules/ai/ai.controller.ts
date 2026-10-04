import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  NlSearchDto,
  PlanItineraryDto,
  GenerateGearChecklistDto,
  GetRecommendationsDto,
} from './dto/ai.dto';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FitnessLevel } from '../users/schemas/user.schema';

@ApiTags('AI Intelligence')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('nl-search')
  @ApiOperation({ summary: 'Natural language trail search ("Easy hikes near Delhi for beginners", etc.)' })
  @ApiResponse({ status: 200, description: 'Matched trails with AI match scores and rationale' })
  async naturalLanguageSearch(@Body() nlDto: NlSearchDto) {
    return this.aiService.searchTrailsNaturalLanguage(nlDto);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('recommendations')
  @ApiOperation({ summary: 'Get personalized trail recommendations' })
  @ApiResponse({ status: 200, description: 'Personalized recommendations' })
  async getRecommendations(
    @Body() dto: GetRecommendationsDto,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.aiService.getPersonalizedRecommendations(dto, userId);
  }

  @Public()
  @Post('itinerary')
  @ApiOperation({ summary: 'Generate detailed AI timeline and pacing itinerary for a hike' })
  @ApiResponse({ status: 200, description: 'AI hike itinerary with hydration calculations' })
  async planItinerary(@Body() dto: PlanItineraryDto) {
    return this.aiService.planItinerary(dto);
  }

  @Public()
  @Post('gear-checklist')
  @ApiOperation({ summary: 'Generate dynamic packing & gear checklist tailored to trail and conditions' })
  @ApiResponse({ status: 200, description: 'Tailored gear checklist' })
  async generateGearChecklist(@Body() dto: GenerateGearChecklistDto) {
    return this.aiService.generateGearChecklist(dto);
  }

  @Public()
  @Get('difficulty-explanation/:trailIdOrSlug')
  @ApiOperation({ summary: 'Explain trail difficulty factors and fitness match' })
  @ApiQuery({ name: 'fitnessLevel', enum: FitnessLevel, required: false })
  @ApiResponse({ status: 200, description: 'Difficulty breakdown and recommendations' })
  async explainDifficulty(
    @Param('trailIdOrSlug') trailIdOrSlug: string,
    @Query('fitnessLevel') fitnessLevel?: FitnessLevel,
  ) {
    return this.aiService.explainDifficulty(trailIdOrSlug, fitnessLevel);
  }
}
