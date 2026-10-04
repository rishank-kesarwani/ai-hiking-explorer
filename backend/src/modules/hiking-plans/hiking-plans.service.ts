import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HikingPlan, HikingPlanDocument, PlanStatus } from './schemas/hiking-plan.schema';
import { CreateHikingPlanDto, UpdateHikingPlanDto } from './dto/create-plan.dto';
import { TrailsService } from '../trails/trails.service';
import { HeuristicAiEngine } from '../ai/providers/heuristic-ai.engine';

@Injectable()
export class HikingPlansService {
  constructor(
    @InjectModel(HikingPlan.name) private readonly planModel: Model<HikingPlanDocument>,
    private readonly trailsService: TrailsService,
    private readonly heuristicAiEngine: HeuristicAiEngine,
  ) {}

  async createPlan(dto: CreateHikingPlanDto, userId?: string) {
    const trail = await this.trailsService.getTrailById(dto.trailIdOrSlug);
    const trailId = (trail as any)._id || dto.trailIdOrSlug;

    // If timeline or checklist wasn't provided, generate with AI engine
    let timeline = dto.timeline;
    if (!timeline || timeline.length === 0) {
      const generated = this.heuristicAiEngine.generateItinerary(trail as any, {
        trailIdOrSlug: dto.trailIdOrSlug,
        hikingDate: dto.scheduledDate,
        preferredStartTime: dto.targetStartTime || '06:30 AM',
      });
      timeline = generated.timeline as any;
    }

    let checklist = dto.checklistItems;
    if (!checklist || checklist.length === 0) {
      const generatedGear = this.heuristicAiEngine.generateGearChecklist(trail as any, {
        trailIdOrSlug: dto.trailIdOrSlug,
      });
      checklist = [
        ...generatedGear.categories.essentials.map((i: any, idx: number) => ({
          id: `ess_${idx}`,
          item: i.item,
          category: i.category,
          isChecked: false,
          required: i.required,
        })),
        ...generatedGear.categories.terrainAndWeather.map((i: any, idx: number) => ({
          id: `ter_${idx}`,
          item: i.item,
          category: i.category,
          isChecked: false,
          required: i.required,
        })),
      ];
    }

    const created = await this.planModel.create({
      userId: userId ? new Types.ObjectId(userId) : undefined,
      title: dto.title,
      trailId: new Types.ObjectId(trailId),
      scheduledDate: new Date(dto.scheduledDate),
      targetStartTime: dto.targetStartTime || '07:00 AM',
      participantsCount: dto.participantsCount || 1,
      status: dto.status || PlanStatus.UPCOMING,
      timeline,
      checklistItems: checklist,
      customNotes: dto.customNotes || '',
      emergencyContacts: dto.emergencyContacts || [],
      isTemporaryGuestPlan: !userId,
    });

    return created.populate('trailId');
  }

  async getUserPlans(userId: string) {
    return this.planModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('trailId')
      .sort({ scheduledDate: 1 })
      .lean()
      .exec();
  }

  async getPlanById(id: string, userId?: string) {
    let plan = null;
    if (Types.ObjectId.isValid(id)) {
      plan = await this.planModel.findById(id).populate('trailId').lean().exec();
    }

    if (!plan) {
      throw new NotFoundException('Hiking plan not found');
    }

    return plan;
  }

  async updatePlan(id: string, dto: UpdateHikingPlanDto, userId: string) {
    const existing = await this.planModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Hiking plan not found');
    }

    if (existing.userId && existing.userId.toString() !== userId) {
      throw new UnauthorizedException('You are not authorized to update this plan');
    }

    const updates: any = { ...dto };
    if (dto.scheduledDate) {
      updates.scheduledDate = new Date(dto.scheduledDate);
    }

    const updated = await this.planModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate('trailId')
      .exec();

    return updated;
  }

  async toggleChecklistItem(planId: string, itemId: string, isChecked: boolean, userId?: string) {
    const plan = await this.planModel.findById(planId).exec();
    if (!plan) throw new NotFoundException('Plan not found');

    const item = plan.checklistItems.find((i) => i.id === itemId);
    if (item) {
      item.isChecked = isChecked;
      await plan.save();
    }

    return plan.populate('trailId');
  }

  async deletePlan(id: string, userId: string) {
    const plan = await this.planModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Plan not found');

    if (plan.userId && plan.userId.toString() !== userId) {
      throw new UnauthorizedException('You are not authorized to delete this plan');
    }

    await this.planModel.findByIdAndDelete(id).exec();
    return { success: true, message: 'Hiking plan deleted' };
  }
}
