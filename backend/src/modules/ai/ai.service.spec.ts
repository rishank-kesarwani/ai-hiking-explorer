import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { TrailsService } from '../trails/trails.service';
import { UsersService } from '../users/users.service';
import { HeuristicAiEngine } from './providers/heuristic-ai.engine';
import { AiPlatformClient } from './providers/ai-platform.client';
import { ResilientCacheService } from '../redis/resilient-cache.service';
import { FitnessLevel } from '../users/schemas/user.schema';
import { TrailDifficulty } from '../trails/schemas/trail.schema';

describe('AiService', () => {
  let service: AiService;
  let trailsService: any;
  let usersService: any;

  const sampleTrail = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Aravalli Biodiversity Park Nature Loop',
    slug: 'aravalli-biodiversity-park-loop',
    difficulty: TrailDifficulty.EASY,
    distanceKm: 5.2,
    elevationGainM: 85,
    estimatedDurationMin: 90,
    region: 'Delhi NCR',
    tags: ['Dog-Friendly', 'Family-Friendly', 'Scenic'],
    terrains: ['Forest', 'Rocky'],
    isDogFriendly: true,
    isFamilyFriendly: true,
    isSunriseSuitable: true,
    hasWaterfall: false,
    waypoints: [
      { title: 'Gate', elevationM: 230, distanceFromStartKm: 0 },
      { title: 'Peak', elevationM: 275, distanceFromStartKm: 2.8 },
    ],
  };

  beforeEach(async () => {
    trailsService = {
      searchTrails: jest.fn().mockResolvedValue({
        trails: [sampleTrail],
        total: 1,
      }),
      getTrailById: jest.fn().mockResolvedValue(sampleTrail),
    };

    usersService = {
      findById: jest.fn().mockResolvedValue({
        _id: 'user_1',
        fitnessLevel: FitnessLevel.BEGINNER,
        preferredTerrains: ['Forest'],
        dogFriendlyPreference: true,
      }),
    };

    const mockCacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const mockAiClient = {
      completePrompt: jest.fn().mockImplementation((prompt, fallback) => fallback()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        HeuristicAiEngine,
        { provide: TrailsService, useValue: trailsService },
        { provide: UsersService, useValue: usersService },
        { provide: AiPlatformClient, useValue: mockAiClient },
        { provide: ResilientCacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('natural language search', () => {
    it('should parse "Easy hikes near Delhi for beginners" and score matches', async () => {
      const result = await service.searchTrailsNaturalLanguage({
        query: 'Easy hikes near Delhi for beginners',
        userFitnessLevel: FitnessLevel.BEGINNER,
      });

      expect(result).toBeDefined();
      expect(result.matchedTrails.length).toBeGreaterThan(0);
      expect(result.matchedTrails[0].aiMatchScore).toBeDefined();
      expect(result.matchedTrails[0].recommendationReason).toBeDefined();
      expect(result.disclaimer).toContain('AI-derived suggestions');
    });

    it('should handle "Show moderate hikes with waterfalls"', async () => {
      const result = await service.searchTrailsNaturalLanguage({
        query: 'Show moderate hikes with waterfalls',
      });

      expect(result.parsedIntent.difficulty).toBe(TrailDifficulty.MODERATE);
      expect(result.parsedIntent.hasWaterfall).toBe(true);
    });
  });

  describe('itinerary planner', () => {
    it('should generate paced timeline and water requirement', async () => {
      const itinerary = await service.planItinerary({
        trailIdOrSlug: 'aravalli-biodiversity-park-loop',
        fitnessLevel: FitnessLevel.BEGINNER,
        preferredStartTime: '06:30 AM',
      });

      expect(itinerary).toBeDefined();
      expect(itinerary.timeline).toBeInstanceOf(Array);
      expect(itinerary.timeline.length).toBeGreaterThan(2);
      expect(itinerary.recommendedWaterLiters).toBeGreaterThan(1);
      expect(itinerary.disclaimer).toContain('AI-generated itineraries are estimates');
    });
  });

  describe('gear checklist generator', () => {
    it('should generate customized checklist with categories', async () => {
      const gear = await service.generateGearChecklist({
        trailIdOrSlug: 'aravalli-biodiversity-park-loop',
        hasDog: true,
      });

      expect(gear).toBeDefined();
      expect(gear.categories.essentials.length).toBeGreaterThan(0);
      expect(gear.totalItemsCount).toBeGreaterThan(0);
    });
  });

  describe('difficulty explanation', () => {
    it('should explain difficulty metrics and user fit', async () => {
      const explanation = await service.explainDifficulty(
        'aravalli-biodiversity-park-loop',
        FitnessLevel.BEGINNER,
      );

      expect(explanation).toBeDefined();
      expect(explanation.trailDifficulty).toBe(TrailDifficulty.EASY);
      expect(explanation.analysisFactors).toBeInstanceOf(Array);
      expect(explanation.disclaimer).toBeDefined();
    });
  });

  describe('personalized recommendations', () => {
    it('should rank recommendations based on user fitness and preferences', async () => {
      const recommendations = await service.getPersonalizedRecommendations(
        { fitnessLevel: FitnessLevel.BEGINNER },
        'user_1',
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.recommendations).toBeInstanceOf(Array);
      expect(recommendations.recommendations[0].aiScore).toBeDefined();
    });
  });
});
