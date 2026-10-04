import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanStatus } from '../schemas/hiking-plan.schema';

export class TimelineStepDto {
  @ApiProperty()
  @IsString()
  time: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  durationMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  elevationM?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;
}

export class ChecklistItemDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  item: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isChecked?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;
}

export class EmergencyContactDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationship?: string;
}

export class CreateHikingPlanDto {
  @ApiProperty({ example: 'Weekend Sunrise Hike to Aravalli' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'aravalli-biodiversity-park-loop' })
  @IsString()
  @IsNotEmpty()
  trailIdOrSlug: string;

  @ApiProperty({ example: '2026-10-15' })
  @IsString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiPropertyOptional({ example: '06:30 AM' })
  @IsOptional()
  @IsString()
  targetStartTime?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  participantsCount?: number;

  @ApiPropertyOptional({ enum: PlanStatus, default: PlanStatus.UPCOMING })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional({ type: [TimelineStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineStepDto)
  timeline?: TimelineStepDto[];

  @ApiPropertyOptional({ type: [ChecklistItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklistItems?: ChecklistItemDto[];

  @ApiPropertyOptional({ example: 'Bring extra lens for wildlife photography' })
  @IsOptional()
  @IsString()
  customNotes?: string;

  @ApiPropertyOptional({ type: [EmergencyContactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];
}

export class UpdateHikingPlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scheduledDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetStartTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  participantsCount?: number;

  @ApiPropertyOptional({ enum: PlanStatus })
  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;

  @ApiPropertyOptional({ type: [ChecklistItemDto] })
  @IsOptional()
  @IsArray()
  checklistItems?: ChecklistItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customNotes?: string;
}
