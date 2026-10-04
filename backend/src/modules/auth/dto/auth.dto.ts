import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FitnessLevel } from '../../users/schemas/user.schema';

export class RegisterDto {
  @ApiProperty({ example: 'hiker@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'Rishank Kesarwani' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ enum: FitnessLevel, default: FitnessLevel.BEGINNER })
  @IsOptional()
  @IsEnum(FitnessLevel)
  fitnessLevel?: FitnessLevel;
}

export class LoginDto {
  @ApiProperty({ example: 'hiker@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token (if not supplied via cookie)' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
