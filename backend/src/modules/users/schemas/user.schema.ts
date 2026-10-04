import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum FitnessLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert',
}

@Schema({ _id: false })
export class NotificationPreferences {
  @Prop({ default: true })
  upcomingHikeReminders: boolean;

  @Prop({ default: true })
  weatherAlerts: boolean;

  @Prop({ default: true })
  gearChecklistReminders: boolean;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ enum: FitnessLevel, default: FitnessLevel.BEGINNER })
  fitnessLevel: FitnessLevel;

  @Prop({ default: 15 }) // minutes per km
  hikingPaceMinPerKm: number;

  @Prop({ type: [String], default: [] })
  preferredTerrains: string[];

  @Prop({ default: 15 }) // 15 km comfortable limit
  maxDistancePreferenceKm: number;

  @Prop({ default: 500 }) // 500 m elevation comfortable limit
  maxElevationGainPreferenceM: number;

  @Prop({ default: false })
  dogFriendlyPreference: boolean;

  @Prop({ default: false })
  familyFriendlyPreference: boolean;

  @Prop({ type: NotificationPreferences, default: () => ({}) })
  notificationSettings: NotificationPreferences;

  @Prop({ default: null })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

