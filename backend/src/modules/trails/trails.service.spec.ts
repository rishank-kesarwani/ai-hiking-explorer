import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TrailsService } from './trails.service';
import { Trail, TrailDifficulty } from './schemas/trail.schema';
import { MockTrailDataProvider } from './providers/mock-trail-data.provider';
import { OsmTrailDataProvider } from './providers/osm-trail-data.provider';
import { ResilientCacheService } from '../redis/resilient-cache.service';

describe('TrailsService', () => {
  let service: TrailsService;
  let mockTrailModel: any;
  let mockCacheService: any;
  let mockTrailProvider: MockTrailDataProvider;
  let osmProvider: any;

  beforeEach(async () => {
    mockTrailModel = {
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(10) }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          {
            title: 'Aravalli Biodiversity Park Nature Loop',
            slug: 'aravalli-biodiversity-park-loop',
            difficulty: TrailDifficulty.EASY,
            distanceKm: 5.2,
            region: 'Delhi NCR',
            tags: ['Dog-Friendly', 'Family-Friendly', 'Scenic'],
            location: { coordinates: [77.1264, 28.5583] },
          },
        ]),
      }),
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          title: 'Aravalli Biodiversity Park Nature Loop',
          slug: 'aravalli-biodiversity-park-loop',
          difficulty: TrailDifficulty.EASY,
        }),
      }),
      findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      }),
      distinct: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(['Delhi NCR', 'Himachal Pradesh']),
      }),
    };

    mockCacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    osmProvider = {
      providerName: 'OpenStreetMap Overpass API Provider',
      getNearbyTrails: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrailsService,
        MockTrailDataProvider,
        {
          provide: OsmTrailDataProvider,
          useValue: osmProvider,
        },
        {
          provide: getModelToken(Trail.name),
          useValue: mockTrailModel,
        },
        {
          provide: ResilientCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<TrailsService>(TrailsService);
    mockTrailProvider = module.get<MockTrailDataProvider>(MockTrailDataProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchTrails', () => {
    it('should search trails with query and difficulty filter', async () => {
      const result = await service.searchTrails({
        query: 'Aravalli',
        difficulty: TrailDifficulty.EASY,
      });

      expect(result).toBeDefined();
      expect(result.trails).toBeInstanceOf(Array);
      expect(result.trails.length).toBeGreaterThan(0);
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should return cached results if present in cache', async () => {
      const cachedPayload = {
        trails: [{ title: 'Cached Trail' }],
        total: 1,
        meta: {},
      };
      mockCacheService.get.mockResolvedValueOnce(cachedPayload);

      const result = await service.searchTrails({ query: 'Cached' });
      expect(result).toEqual(cachedPayload);
    });

    it('should gracefully fallback to mock provider if database query fails', async () => {
      mockTrailModel.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(new Error('Mongo connection lost')),
      });

      const result = await service.searchTrails({ region: 'Delhi NCR' });
      expect(result).toBeDefined();
      expect(result.trails.length).toBeGreaterThan(0);
    });
  });

  describe('geospatial search (getNearbyTrails)', () => {
    it('should execute geospatial search near given coordinates', async () => {
      const result = await service.getNearbyTrails({
        latitude: 28.5583,
        longitude: 77.1264,
        maxDistanceKm: 25,
      });

      expect(result).toBeDefined();
      expect(result.trails).toBeInstanceOf(Array);
      expect(result.userCoordinates).toEqual([77.1264, 28.5583]);
    });
  });

  describe('getTrailById', () => {
    it('should return trail with safety disclaimer', async () => {
      const trail = await service.getTrailById('aravalli-biodiversity-park-loop');
      expect(trail).toBeDefined();
      expect(trail.safetyDisclaimer).toContain('IMPORTANT SAFETY NOTICE');
    });

    it('should throw NotFoundException if trail does not exist', async () => {
      mockTrailModel.findOne.mockReturnValueOnce({
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      await expect(service.getTrailById('non-existent-trail-999')).rejects.toThrow();
    });
  });
});
