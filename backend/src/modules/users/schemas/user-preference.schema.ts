import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPreferenceDocument = UserPreference & Document;

@Schema({ timestamps: true })
export class UserPreference {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  favoriteTags: string[];

  @Prop({
    type: {
      city: { type: String, default: 'Delhi' },
      coordinates: { type: [Number], default: [77.209, 28.6139] }, // [lng, lat]
    },
    default: { city: 'Delhi', coordinates: [77.209, 28.6139] },
  })
  defaultLocation: {
    city: string;
    coordinates: [number, number];
  };

  @Prop({ type: [String], default: [] })
  customGearChecklist: string[];
}

export const UserPreferenceSchema = SchemaFactory.createForClass(UserPreference);

