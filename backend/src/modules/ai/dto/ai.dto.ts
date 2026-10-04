import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FitnessLevel } from '../../users/schemas/user.schema';
import { TrailDifficulty } from '../../trails/schemas/trail.schema';

export class NlSearchDto {
  @ApiProperty({
    example: 'Easy hikes near Delhi for beginners with scenic views',
    description: 'Natural language search query from user',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({ example: 28.6139 })
  @IsOptional()
  @IsNumber()
  userLatitude?: number;

  @ApiPropertyOptional({ example: 77.2090 })
  @IsOptional()
  @IsNumber()
  userLongitude?: number;

  @ApiPropertyOptional({ enum: FitnessLevel, example: FitnessLevel.BEGINNER })
  @IsOptional()
  @IsEnum(FitnessLevel)
  userFitnessLevel?: FitnessLevel;
}

export class PlanItineraryDto {
  @ApiProperty({ example: 'aravalli-biodiversity-park-loop' })
  @IsString()
  @IsNotEmpty()
  trailIdOrSlug: string;

  @ApiPropertyOptional({ example: '2026-10-10' })
  @IsOptional()
  @IsString()
  hikingDate?: string;

  @ApiPropertyOptional({ example: '06:30' })
  @IsOptional()
  @IsString()
  preferredStartTime?: string;

  @ApiPropertyOptional({ enum: FitnessLevel, default: FitnessLevel.INTERMEDIATE })
  @IsOptional()
  @IsEnum(FitnessLevel)
  fitnessLevel?: FitnessLevel;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  groupSize?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasDog?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasChildren?: boolean;

  @ApiPropertyOptional({ example: 'Want to catch sunrise and take photos of birds' })
  @IsOptional()
  @IsString()
  specialGoals?: string;
}

export class GenerateGearChecklistDto {
  @ApiProperty({ example: 'triund-ridge-panoramic-trek' })
  @IsString()
  @IsNotEmpty()
  trailIdOrSlug: string;

  @ApiPropertyOptional({ example: 'autumn' })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isOvernightCamping?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hasDog?: boolean;
}

export class GetRecommendationsDto {
  @ApiPropertyOptional({ enum: FitnessLevel, example: FitnessLevel.INTERMEDIATE })
  @IsOptional()
  @IsEnum(FitnessLevel)
  fitnessLevel?: FitnessLevel;

  @ApiPropertyOptional({ example: ['Forest', 'Mountain'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTerrains?: string[];

  @ApiPropertyOptional({ example: 28.6139 })
  @IsOptional()
  @IsNumber()
  userLatitude?: number;

  @ApiPropertyOptional({ example: 77.2090 })
  @IsOptional()
  @IsNumber()
  userLongitude?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDogFriendly?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFamilyFriendly?: boolean;
}
