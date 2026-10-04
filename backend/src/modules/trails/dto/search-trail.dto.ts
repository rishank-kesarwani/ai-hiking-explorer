import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TrailDifficulty } from '../schemas/trail.schema';

export class SearchTrailDto {
  @ApiPropertyOptional({ example: 'waterfall' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ example: 'Delhi NCR' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ enum: TrailDifficulty })
  @IsOptional()
  @IsEnum(TrailDifficulty)
  difficulty?: TrailDifficulty;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minDistance?: number;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDistance?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minElevation?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxElevation?: number;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDurationMin?: number;

  @ApiPropertyOptional({ example: 'Forest' })
  @IsOptional()
  @IsString()
  terrain?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isDogFriendly?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFamilyFriendly?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isCampingAllowed?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isSunriseSuitable?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isSunsetSuitable?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasWaterfall?: boolean;

  @ApiPropertyOptional({ example: 10, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({ enum: ['rating', 'distance', 'elevation', 'duration', 'popular'] })
  @IsOptional()
  @IsString()
  sortBy?: 'rating' | 'distance' | 'elevation' | 'duration' | 'popular';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class NearbyTrailDto {
  @ApiPropertyOptional({ example: 28.6139 })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiPropertyOptional({ example: 77.2090 })
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 50, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  maxDistanceKm?: number;

  @ApiPropertyOptional({ enum: TrailDifficulty })
  @IsOptional()
  @IsEnum(TrailDifficulty)
  difficulty?: TrailDifficulty;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}
