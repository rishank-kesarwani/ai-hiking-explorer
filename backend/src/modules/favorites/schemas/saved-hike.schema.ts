import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SavedHikeDocument = SavedHike & Document;

export enum HikeStatus {
  PLANNED = 'Planned',
  COMPLETED = 'Completed',
  WISHLIST = 'Wishlist',
}

@Schema({ timestamps: true })
export class SavedHike {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Trail', required: true, index: true })
  trailId: Types.ObjectId;

  @Prop({ enum: HikeStatus, default: HikeStatus.PLANNED })
  status: HikeStatus;

  @Prop()
  scheduledDate?: Date;

  @Prop()
  completedDate?: Date;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: 0 })
  ratingGiven?: number;

  @Prop({ default: '' })
  difficultyFelt?: string;
}

export const SavedHikeSchema = SchemaFactory.createForClass(SavedHike);
SavedHikeSchema.index({ userId: 1, status: 1 });
