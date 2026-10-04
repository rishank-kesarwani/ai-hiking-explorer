import { Injectable, Logger } from '@nestjs/common';
import { TrailsService } from '../trails/trails.service';
import { UsersService } from '../users/users.service';
import { HeuristicAiEngine } from './providers/heuristic-ai.engine';
import { AiPlatformClient } from './providers/ai-platform.client';
import { ResilientCacheService } from '../redis/resilient-cache.service';
import {
  NlSearchDto,
  PlanItineraryDto,
  GenerateGearChecklistDto,
  GetRecommendationsDto,
} from './dto/ai.dto';
import { FitnessLevel } from '../users/schemas/user.schema';
import { TrailDifficulty } from '../trails/schemas/trail.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly trailsService: TrailsService,
    private readonly usersService: UsersService,
    private readonly heuristicEngine: HeuristicAiEngine,
    private readonly aiClient: AiPlatformClient,
    private readonly cacheService: ResilientCacheService,
  ) {}

  async searchTrailsNaturalLanguage(dto: NlSearchDto) {
    const cacheKey = `ai:nl-search:${dto.query.toLowerCase().trim()}:${dto.userFitnessLevel || 'none'}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const parsedIntent = this.heuristicEngine.parseNaturalLanguageQuery(
      dto.query,
      dto.userFitnessLevel,
    );

    // Search trails based on parsed intent
    const searchResult = await this.trailsService.searchTrails({
      region: parsedIntent.region,
      difficulty: parsedIntent.difficulty,
      maxDistance: parsedIntent.targetDistanceKm ? parsedIntent.targetDistanceKm * 1.5 : undefined,
      minDistance: parsedIntent.targetDistanceKm ? Math.max(0, parsedIntent.targetDistanceKm * 0.5) : undefined,
      isDogFriendly: parsedIntent.isDogFriendly,
      isFamilyFriendly: parsedIntent.isFamilyFriendly,
      isCampingAllowed: parsedIntent.isCampingAllowed,
      isSunriseSuitable: parsedIntent.isSunriseSuitable,
      isSunsetSuitable: parsedIntent.isSunsetSuitable,
      hasWaterfall: parsedIntent.hasWaterfall,
      limit: 15,
    });

    let trails = searchResult.trails;

    // Fallback if strict filter returned 0 trails
    if (trails.length === 0) {
      const relaxedResult = await this.trailsService.searchTrails({
        query: parsedIntent.extractedKeywords.join(' '),
        limit: 10,
      });
      trails = relaxedResult.trails;
    }

    // Score and enrich each trail with recommendation reasoning
    const scoredTrails = trails.map((trail: any) => {
      let score = 70;
      const reasons: string[] = [];

      if (parsedIntent.difficulty && trail.difficulty === parsedIntent.difficulty) {
        score += 15;
        reasons.push(`Matches your requested ${trail.difficulty} difficulty level.`);
      }

      if (parsedIntent.region && trail.region?.toLowerCase().includes(parsedIntent.region.toLowerCase())) {
        score += 15;
        reasons.push(`Located in ${trail.region}, exactly within your target exploration area.`);
      }

      if (parsedIntent.hasWaterfall && trail.hasWaterfall) {
        score += 15;
        reasons.push('Features rushing waterfalls and natural scenic cascades.');
      }

      if (parsedIntent.isSunriseSuitable && trail.isSunriseSuitable) {
        score += 10;
        reasons.push('Ideal east-facing ridge line for breathtaking sunrise vistas.');
      }

      if (parsedIntent.isDogFriendly && trail.isDogFriendly) {
        score += 10;
        reasons.push('Pet-friendly trail with safe pathways for dogs.');
      }

      if (parsedIntent.targetDistanceKm && trail.distanceKm) {
        const diff = Math.abs(trail.distanceKm - parsedIntent.targetDistanceKm);
        if (diff < 2) {
          score += 10;
          reasons.push(`Distance (${trail.distanceKm} km) aligns perfectly with your ~${parsedIntent.targetDistanceKm} km target.`);
        }
      }

      if (reasons.length === 0) {
        reasons.push('High-rated trail matching overall keywords and terrain preferences.');
      }

      return {
        ...trail,
        aiMatchScore: Math.min(99, score),
        recommendationReason: reasons.join(' '),
      };
    });

    scoredTrails.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

    const response = {
      query: dto.query,
      parsedIntent,
      matchedTrails: scoredTrails,
      totalMatches: scoredTrails.length,
      aiSummary: `Found ${scoredTrails.length} trails matching "${dto.query}". ${parsedIntent.summaryExplanation}`,
      disclaimer: 'AI-derived suggestions are synthesized from trail data patterns and user input. AI cannot guarantee real-time safety, closures, or mountain hazards.',
    };

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  async getPersonalizedRecommendations(dto: GetRecommendationsDto, userId?: string) {
    let userFitness = dto.fitnessLevel || FitnessLevel.INTERMEDIATE;
    let preferredTerrains = dto.preferredTerrains || [];
    let isDog = dto.isDogFriendly;
    let isFamily = dto.isFamilyFriendly;

    if (userId) {
      const user = await this.usersService.findById(userId);
      if (user) {
        userFitness = user.fitnessLevel || userFitness;
        preferredTerrains = user.preferredTerrains?.length ? user.preferredTerrains : preferredTerrains;
        if (user.dogFriendlyPreference !== undefined) isDog = user.dogFriendlyPreference;
        if (user.familyFriendlyPreference !== undefined) isFamily = user.familyFriendlyPreference;
      }
    }

    const cacheKey = `ai:recommendations:${userFitness}:${preferredTerrains.join(',')}:${isDog}:${isFamily}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    // Fetch trails
    const { trails } = await this.trailsService.searchTrails({ limit: 30 });

    const scored = trails.map((trail: any) => {
      let score = 65;
      const reasons: string[] = [];

      // Fitness match
      if (userFitness === FitnessLevel.BEGINNER) {
        if (trail.difficulty === TrailDifficulty.EASY) {
          score += 25;
          reasons.push('Gentle elevation and clear trails ideal for beginner endurance building.');
        } else if (trail.difficulty === TrailDifficulty.MODERATE) {
          score += 10;
          reasons.push('Moderate challenge to step up your hiking experience safely.');
        }
      } else if (userFitness === FitnessLevel.ADVANCED || userFitness === FitnessLevel.EXPERT) {
        if (trail.difficulty === TrailDifficulty.HARD || trail.difficulty === TrailDifficulty.EXPERT) {
          score += 25;
          reasons.push('Challenging vertical profile and technical terrain tailored for advanced fitness.');
        } else if (trail.difficulty === TrailDifficulty.MODERATE) {
          score += 15;
          reasons.push('Great brisk aerobic trail with high scenic reward.');
        }
      } else {
        if (trail.difficulty === TrailDifficulty.MODERATE) {
          score += 25;
          reasons.push('Balanced distance and elevation gain for intermediate hikers.');
        }
      }

      // Terrain affinity
      if (preferredTerrains.length > 0) {
        const matchesTerrain = trail.terrains?.some((t: string) => preferredTerrains.includes(t));
        if (matchesTerrain) {
          score += 15;
          reasons.push(`Features your favorite terrain types (${trail.terrains?.join(', ')}).`);
        }
      }

      if (isDog && trail.isDogFriendly) {
        score += 10;
        reasons.push('Dog-friendly trail suitable for your canine companion.');
      }

      if (isFamily && trail.isFamilyFriendly) {
        score += 10;
        reasons.push('Safe, accessible trail suitable for family groups.');
      }

      // Rating bonus
      score += (trail.rating || 4.5) * 2;

      return {
        ...trail,
        aiScore: Math.min(99, Math.round(score)),
        personalizedReason: reasons.join(' '),
      };
    });

    scored.sort((a, b) => b.aiScore - a.aiScore);
    const topRecommended = scored.slice(0, 8);

    const response = {
      userProfile: {
        fitnessLevel: userFitness,
        preferredTerrains,
        isDogFriendly: isDog,
        isFamilyFriendly: isFamily,
      },
      recommendations: topRecommended,
      aiSummary: `Curated ${topRecommended.length} trails prioritized for your ${userFitness} fitness profile and outdoor preferences.`,
      disclaimer: 'Personalized recommendations are generated algorithmically for inspiration. Assess personal health and trail conditions before heading out.',
    };

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  async planItinerary(dto: PlanItineraryDto) {
    const trail = await this.trailsService.getTrailById(dto.trailIdOrSlug);
    return this.heuristicEngine.generateItinerary(trail as any, dto);
  }

  async generateGearChecklist(dto: GenerateGearChecklistDto) {
    const trail = await this.trailsService.getTrailById(dto.trailIdOrSlug);
    return this.heuristicEngine.generateGearChecklist(trail as any, dto);
  }

  async explainDifficulty(trailIdOrSlug: string, fitnessLevel?: FitnessLevel) {
    const trail = await this.trailsService.getTrailById(trailIdOrSlug);
    return this.heuristicEngine.explainTrailDifficulty(trail as any, fitnessLevel);
  }
}
