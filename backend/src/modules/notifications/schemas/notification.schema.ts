import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  UPCOMING_HIKE_REMINDER = 'upcoming_hike_reminder',
  WEATHER_ALERT = 'weather_alert',
  GEAR_CHECKLIST_REMINDER = 'gear_checklist_reminder',
  TRAIL_SAFETY_NOTICE = 'trail_safety_notice',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ enum: NotificationType, default: NotificationType.UPCOMING_HIKE_REMINDER })
  type: NotificationType;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Trail' })
  trailId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'HikingPlan' })
  planId?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
