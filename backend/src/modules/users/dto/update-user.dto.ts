import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FitnessLevel } from '../schemas/user.schema';

export class NotificationSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  upcomingHikeReminders?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  weatherAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  gearChecklistReminders?: boolean;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Rishank Kesarwani' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Trail runner and nature explorer' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ enum: FitnessLevel, example: FitnessLevel.INTERMEDIATE })
  @IsOptional()
  @IsEnum(FitnessLevel)
  fitnessLevel?: FitnessLevel;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsNumber()
  hikingPaceMinPerKm?: number;

  @ApiPropertyOptional({ example: ['Forest', 'Mountain', 'Waterfall'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTerrains?: string[];

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  maxDistancePreferenceKm?: number;

  @ApiPropertyOptional({ example: 800 })
  @IsOptional()
  @IsNumber()
  maxElevationGainPreferenceM?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  dogFriendlyPreference?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  familyFriendlyPreference?: boolean;

  @ApiPropertyOptional({ type: NotificationSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notificationSettings?: NotificationSettingsDto;
}
