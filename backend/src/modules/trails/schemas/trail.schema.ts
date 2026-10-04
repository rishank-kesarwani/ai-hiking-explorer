import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrailDocument = Trail & Document;

export enum TrailDifficulty {
  EASY = 'Easy',
  MODERATE = 'Moderate',
  HARD = 'Hard',
  EXPERT = 'Expert',
}

export enum TrailRouteType {
  LOOP = 'Loop',
  OUT_AND_BACK = 'Out & Back',
  POINT_TO_POINT = 'Point to Point',
}

@Schema({ _id: false })
export class GeoLocation {
  @Prop({ type: String, enum: ['Point'], default: 'Point' })
  type: string;

  @Prop({ type: [Number], required: true }) // [longitude, latitude]
  coordinates: [number, number];
}

@Schema({ _id: false })
export class Waypoint {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [Number], required: true }) // [longitude, latitude]
  coordinates: [number, number];

  @Prop({ default: 0 })
  elevationM: number;

  @Prop({ default: 0 })
  distanceFromStartKm: number;

  @Prop({ type: [String], default: [] })
  type: string[]; // e.g. ['viewpoint', 'water_source', 'campsite', 'hazard', 'rest_area']
}

@Schema({ _id: false })
export class ElevationPoint {
  @Prop({ required: true })
  distanceKm: number;

  @Prop({ required: true })
  elevationM: number;
}

@Schema({ timestamps: true })
export class Trail {
  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ required: true, unique: true, index: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, index: true })
  region: string;

  @Prop({ default: 'India' })
  country: string;

  @Prop({ type: GeoLocation, required: true, index: '2dsphere' })
  location: GeoLocation;

  @Prop({ enum: TrailDifficulty, required: true, index: true })
  difficulty: TrailDifficulty;

  @Prop({ required: true, index: true }) // in kilometers
  distanceKm: number;

  @Prop({ required: true }) // in meters
  elevationGainM: number;

  @Prop({ required: true }) // in meters
  highestPointM: number;

  @Prop({ required: true }) // in minutes
  estimatedDurationMin: number;

  @Prop({ enum: TrailRouteType, default: TrailRouteType.OUT_AND_BACK })
  routeType: TrailRouteType;

  @Prop({ type: [String], default: [], index: true })
  terrains: string[]; // ['Forest', 'Mountain', 'Rocky', 'Waterfall', 'Desert', 'Alpine', 'Meadow', 'River']

  @Prop({ type: [String], default: [], index: true })
  tags: string[]; // ['Dog-Friendly', 'Family-Friendly', 'Scenic', 'Waterfall', 'Camping', 'Sunrise/Sunset', 'River View', 'Wildlife']

  @Prop({ default: true })
  isDogFriendly: boolean;

  @Prop({ default: true })
  isFamilyFriendly: boolean;

  @Prop({ default: false })
  isCampingAllowed: boolean;

  @Prop({ default: false })
  isSunriseSuitable: boolean;

  @Prop({ default: false })
  isSunsetSuitable: boolean;

  @Prop({ default: false })
  hasWaterfall: boolean;

  @Prop({ default: 4.5, index: true })
  rating: number;

  @Prop({ default: 120 })
  reviewCount: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [Waypoint], default: [] })
  waypoints: Waypoint[];

  @Prop({ type: [ElevationPoint], default: [] })
  elevationProfile: ElevationPoint[];

  @Prop({ type: [String], default: [] })
  recommendedGear: string[];

  @Prop({ type: [String], default: [] })
  safetyWarnings: string[];

  @Prop({ default: 'Open' })
  currentStatus: string; // 'Open', 'Caution', 'Temporarily Closed', 'Seasonal'

  @Prop({ default: 'Local mock & verified trail database' })
  dataSource: string;

  @Prop({ default: false })
  isDemoData: boolean;
}

export const TrailSchema = SchemaFactory.createForClass(Trail);

// Compound indexes for high performance filtering
TrailSchema.index({ difficulty: 1, distanceKm: 1 });
TrailSchema.index({ region: 1, difficulty: 1 });
TrailSchema.index({ tags: 1, rating: -1 });
TrailSchema.index({ title: 'text', description: 'text', region: 'text' });
