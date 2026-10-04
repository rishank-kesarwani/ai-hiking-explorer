import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HikingPlansService } from './hiking-plans.service';
import { CreateHikingPlanDto, UpdateHikingPlanDto } from './dto/create-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Hiking Plans')
@Controller('hiking-plans')
export class HikingPlansController {
  constructor(private readonly plansService: HikingPlansService) {}

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a hiking plan (supports both logged-in users and anonymous temporary trips)' })
  @ApiResponse({ status: 201, description: 'Hiking plan created' })
  async createPlan(
    @Body() dto: CreateHikingPlanDto,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.plansService.createPlan(dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all hiking plans for authenticated user' })
  @ApiResponse({ status: 200, description: 'List of user hiking plans' })
  async getUserPlans(@CurrentUser('userId') userId: string) {
    return this.plansService.getUserPlans(userId);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get specific hiking plan details' })
  @ApiResponse({ status: 200, description: 'Plan details' })
  async getPlanById(
    @Param('id') id: string,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.plansService.getPlanById(id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update an existing hiking plan' })
  @ApiResponse({ status: 200, description: 'Plan updated' })
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateHikingPlanDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.plansService.updatePlan(id, dto, userId);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Patch(':id/checklist/:itemId')
  @ApiOperation({ summary: 'Toggle gear checklist item packed status' })
  @ApiResponse({ status: 200, description: 'Item state updated' })
  async toggleChecklistItem(
    @Param('id') planId: string,
    @Param('itemId') itemId: string,
    @Body('isChecked') isChecked: boolean,
    @CurrentUser('userId') userId?: string,
  ) {
    return this.plansService.toggleChecklistItem(planId, itemId, isChecked, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a hiking plan' })
  @ApiResponse({ status: 200, description: 'Plan deleted' })
  async deletePlan(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.plansService.deletePlan(id, userId);
  }
}
