import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HikingPlanDocument = HikingPlan & Document;

export enum PlanStatus {
  DRAFT = 'Draft',
  UPCOMING = 'Upcoming',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived',
}

@Schema({ _id: false })
export class PlanTimelineStep {
  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 30 })
  durationMin: number;

  @Prop({ default: 0 })
  elevationM: number;

  @Prop({ default: 'general' })
  type: string;
}

@Schema({ _id: false })
export class PlanChecklistItem {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  item: string;

  @Prop({ default: 'General' })
  category: string;

  @Prop({ default: false })
  isChecked: boolean;

  @Prop({ default: true })
  required: boolean;
}

@Schema({ _id: false })
export class EmergencyContact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: 'Family' })
  relationship: string;
}

@Schema({ timestamps: true })
export class HikingPlan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Trail', required: true })
  trailId: Types.ObjectId;

  @Prop({ required: true })
  scheduledDate: Date;

  @Prop({ default: '07:00 AM' })
  targetStartTime: string;

  @Prop({ default: 1 })
  participantsCount: number;

  @Prop({ enum: PlanStatus, default: PlanStatus.UPCOMING })
  status: PlanStatus;

  @Prop({ type: [PlanTimelineStep], default: [] })
  timeline: PlanTimelineStep[];

  @Prop({ type: [PlanChecklistItem], default: [] })
  checklistItems: PlanChecklistItem[];

  @Prop({ default: '' })
  customNotes: string;

  @Prop({ type: [EmergencyContact], default: [] })
  emergencyContacts: EmergencyContact[];

  @Prop({ default: false })
  isTemporaryGuestPlan: boolean;
}

export const HikingPlanSchema = SchemaFactory.createForClass(HikingPlan);
HikingPlanSchema.index({ userId: 1, scheduledDate: 1 });
