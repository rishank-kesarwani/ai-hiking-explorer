import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FavoriteTrailDocument = FavoriteTrail & Document;

@Schema({ timestamps: true })
export class FavoriteTrail {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Trail', required: true, index: true })
  trailId: Types.ObjectId;
}

export const FavoriteTrailSchema = SchemaFactory.createForClass(FavoriteTrail);
FavoriteTrailSchema.index({ userId: 1, trailId: 1 }, { unique: true });
