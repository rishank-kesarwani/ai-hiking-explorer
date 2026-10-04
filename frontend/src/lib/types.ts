export type TrailDifficulty = 'Easy' | 'Moderate' | 'Hard' | 'Expert';
export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type HikeStatus = 'Planned' | 'Completed' | 'Wishlist';

export interface GeoLocation {
  type: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface Waypoint {
  title: string;
  description: string;
  coordinates: [number, number];
  elevationM: number;
  distanceFromStartKm: number;
  type: string[];
}

export interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
}

export interface Trail {
  _id: string;
  title: string;
  slug: string;
  description: string;
  region: string;
  country: string;
  location: GeoLocation;
  difficulty: TrailDifficulty;
  distanceKm: number;
  elevationGainM: number;
  highestPointM: number;
  estimatedDurationMin: number;
  routeType: string;
  terrains: string[];
  tags: string[];
  isDogFriendly: boolean;
  isFamilyFriendly: boolean;
  isCampingAllowed: boolean;
  isSunriseSuitable: boolean;
  isSunsetSuitable: boolean;
  hasWaterfall: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  waypoints?: Waypoint[];
  elevationProfile?: ElevationPoint[];
  recommendedGear?: string[];
  safetyWarnings?: string[];
  currentStatus?: string;
  dataSource?: string;
  isDemoData?: boolean;
  calculatedDistanceKm?: number;
  aiMatchScore?: number;
  aiScore?: number;
  recommendationReason?: string;
  personalizedReason?: string;
  safetyDisclaimer?: string;
}

export interface User {
  _id?: string;
  userId?: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  fitnessLevel: FitnessLevel;
  hikingPaceMinPerKm?: number;
  preferredTerrains?: string[];
  maxDistancePreferenceKm?: number;
  maxElevationGainPreferenceM?: number;
  dogFriendlyPreference?: boolean;
  familyFriendlyPreference?: boolean;
  notificationSettings?: {
    upcomingHikeReminders: boolean;
    weatherAlerts: boolean;
    gearChecklistReminders: boolean;
  };
}

export interface WeatherForecast {
  temperatureC: number;
  feelsLikeC: number;
  condition: string;
  conditionCode: number;
  humidityPercent: number;
  windSpeedKmh: number;
  precipitationProbabilityPercent: number;
  uvIndex: number;
  sunriseTime: string;
  sunsetTime: string;
  isHazardous: boolean;
  hazardWarnings: string[];
  hourlyForecast: Array<{
    time: string;
    temperatureC: number;
    condition: string;
    precipitationProbability: number;
  }>;
  dailyForecast: Array<{
    date: string;
    tempMaxC: number;
    tempMinC: number;
    condition: string;
    precipitationProbability: number;
    sunrise: string;
    sunset: string;
  }>;
  provider: string;
  isLiveProvider: boolean;
  fetchedAt: string;
  disclaimer: string;
}

export interface HikingPlan {
  _id: string;
  userId?: string;
  title: string;
  trailId: Trail | string;
  scheduledDate: string;
  targetStartTime: string;
  participantsCount: number;
  status: string;
  timeline: Array<{
    time: string;
    title: string;
    description?: string;
    durationMin?: number;
    elevationM?: number;
    type?: string;
  }>;
  checklistItems: Array<{
    id: string;
    item: string;
    category?: string;
    isChecked: boolean;
    required: boolean;
  }>;
  customNotes?: string;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    relationship?: string;
  }>;
  isTemporaryGuestPlan?: boolean;
  createdAt?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  trailId?: Trail | string;
  planId?: string;
}
