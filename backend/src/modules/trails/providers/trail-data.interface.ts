import { Trail } from '../schemas/trail.schema';

export interface TrailSearchParams {
  query?: string;
  region?: string;
  difficulty?: string;
  minDistance?: number;
  maxDistance?: number;
  minElevation?: number;
  maxElevation?: number;
  maxDurationMin?: number;
  terrain?: string;
  tags?: string[];
  isDogFriendly?: boolean;
  isFamilyFriendly?: boolean;
  isCampingAllowed?: boolean;
  isSunriseSuitable?: boolean;
  isSunsetSuitable?: boolean;
  hasWaterfall?: boolean;
  limit?: number;
  skip?: number;
  sortBy?: 'rating' | 'distance' | 'elevation' | 'duration' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

export interface NearbyTrailParams {
  latitude: number;
  longitude: number;
  maxDistanceKm?: number;
  difficulty?: string;
  limit?: number;
}

export interface ITrailDataProvider {
  readonly providerName: string;
  readonly isLiveProvider: boolean;

  searchTrails(params: TrailSearchParams): Promise<{ trails: Partial<Trail>[]; total: number }>;
  getTrailById(id: string): Promise<Partial<Trail> | null>;
  getNearbyTrails(params: NearbyTrailParams): Promise<Partial<Trail>[]>;
  getSeedData(): Partial<Trail>[];
}
