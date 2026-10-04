import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trail, TrailDocument } from './schemas/trail.schema';
import { SearchTrailDto, NearbyTrailDto } from './dto/search-trail.dto';
import { MockTrailDataProvider } from './providers/mock-trail-data.provider';
import { OsmTrailDataProvider } from './providers/osm-trail-data.provider';
import { ResilientCacheService } from '../redis/resilient-cache.service';
import { GeoUtil } from '../../common/utils/geo.util';

@Injectable()
export class TrailsService implements OnModuleInit {
  private readonly logger = new Logger(TrailsService.name);

  constructor(
    @InjectModel(Trail.name) private readonly trailModel: Model<TrailDocument>,
    private readonly mockProvider: MockTrailDataProvider,
    private readonly osmProvider: OsmTrailDataProvider,
    private readonly cacheService: ResilientCacheService,
  ) {}

  async onModuleInit() {
    await this.seedInitialTrails();
  }

  async seedInitialTrails() {
    try {
      const count = await this.trailModel.countDocuments();
      if (count === 0) {
        this.logger.log('Seeding initial curated hiking trails into MongoDB...');
        const seedData = this.mockProvider.getSeedData();
        await this.trailModel.insertMany(seedData);
        this.logger.log(`Successfully seeded ${seedData.length} curated trails.`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not seed trails into MongoDB: ${err.message}. Mock provider fallback will serve queries.`);
    }
  }

  async searchTrails(params: SearchTrailDto) {
    const cacheKey = `trails:search:${JSON.stringify(params)}`;
    const cached = await this.cacheService.get<{ trails: any[]; total: number; meta: any }>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const filter: Record<string, any> = {};

      if (params.query) {
        const regex = new RegExp(params.query, 'i');
        filter.$or = [
          { title: regex },
          { description: regex },
          { region: regex },
          { terrains: regex },
          { tags: regex },
        ];
      }

      if (params.region) {
        filter.region = new RegExp(params.region, 'i');
      }

      if (params.difficulty) {
        filter.difficulty = params.difficulty;
      }

      if (params.minDistance !== undefined || params.maxDistance !== undefined) {
        filter.distanceKm = {};
        if (params.minDistance !== undefined) filter.distanceKm.$gte = params.minDistance;
        if (params.maxDistance !== undefined) filter.distanceKm.$lte = params.maxDistance;
      }

      if (params.minElevation !== undefined || params.maxElevation !== undefined) {
        filter.elevationGainM = {};
        if (params.minElevation !== undefined) filter.elevationGainM.$gte = params.minElevation;
        if (params.maxElevation !== undefined) filter.elevationGainM.$lte = params.maxElevation;
      }

      if (params.maxDurationMin !== undefined) {
        filter.estimatedDurationMin = { $lte: params.maxDurationMin };
      }

      if (params.terrain) {
        filter.terrains = new RegExp(params.terrain, 'i');
      }

      if (params.isDogFriendly !== undefined) filter.isDogFriendly = params.isDogFriendly;
      if (params.isFamilyFriendly !== undefined) filter.isFamilyFriendly = params.isFamilyFriendly;
      if (params.isCampingAllowed !== undefined) filter.isCampingAllowed = params.isCampingAllowed;
      if (params.isSunriseSuitable !== undefined) filter.isSunriseSuitable = params.isSunriseSuitable;
      if (params.isSunsetSuitable !== undefined) filter.isSunsetSuitable = params.isSunsetSuitable;
      if (params.hasWaterfall !== undefined) filter.hasWaterfall = params.hasWaterfall;

      const sortOptions: Record<string, any> = {};
      if (params.sortBy === 'distance') {
        sortOptions.distanceKm = params.sortOrder === 'desc' ? -1 : 1;
      } else if (params.sortBy === 'elevation') {
        sortOptions.elevationGainM = params.sortOrder === 'desc' ? -1 : 1;
      } else if (params.sortBy === 'duration') {
        sortOptions.estimatedDurationMin = params.sortOrder === 'desc' ? -1 : 1;
      } else if (params.sortBy === 'rating') {
        sortOptions.rating = params.sortOrder === 'asc' ? 1 : -1;
      } else {
        sortOptions.rating = -1;
        sortOptions.reviewCount = -1;
      }

      const skip = params.skip || 0;
      const limit = params.limit || 20;

      const [trails, total] = await Promise.all([
        this.trailModel
          .find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.trailModel.countDocuments(filter).exec(),
      ]);

      const result = {
        trails,
        total,
        meta: {
          page: Math.floor(skip / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit),
          isLiveProvider: false,
          disclaimer: 'Trail conditions, distances, and elevations are provided for informational guidance only. Always exercise caution and verify with local authorities.',
        },
      };

      await this.cacheService.set(cacheKey, result, 180); // 3 minutes cache
      return result;
    } catch (err: any) {
      this.logger.warn(`MongoDB search error (${err.message}), falling back to in-memory mock provider`);
      const fallbackResult = await this.mockProvider.searchTrails(params);
      return {
        trails: fallbackResult.trails,
        total: fallbackResult.total,
        meta: {
          page: 1,
          limit: params.limit || 20,
          totalPages: Math.ceil(fallbackResult.total / (params.limit || 20)),
          isLiveProvider: false,
          disclaimer: 'Trail conditions, distances, and elevations are provided for informational guidance only.',
        },
      };
    }
  }

  async getNearbyTrails(params: NearbyTrailDto) {
    const cacheKey = `trails:nearby:${params.latitude}:${params.longitude}:${params.maxDistanceKm || 50}:${params.difficulty || 'all'}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const maxDistanceMeters = (params.maxDistanceKm || 50) * 1000;
    const limit = params.limit || 10;

    try {
      const geoQuery: any = {
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: [params.longitude, params.latitude],
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      };

      if (params.difficulty) {
        geoQuery.difficulty = params.difficulty;
      }

      const trails = await this.trailModel
        .find(geoQuery)
        .limit(limit)
        .lean()
        .exec();

      if (trails.length > 0) {
        const trailsWithDistance = trails.map((t) => {
          const [lng, lat] = t.location?.coordinates || [0, 0];
          const distKm = GeoUtil.calculateDistanceKm(
            params.latitude,
            params.longitude,
            lat,
            lng,
          );
          return {
            ...t,
            calculatedDistanceKm: distKm,
          };
        });

        const result = {
          trails: trailsWithDistance,
          total: trailsWithDistance.length,
          userCoordinates: [params.longitude, params.latitude],
          meta: {
            provider: 'MongoDB Geospatial (2dsphere)',
            disclaimer: 'Geospatial distances are calculated as straight-line distances to trailheads.',
          },
        };

        await this.cacheService.set(cacheKey, result, 300);
        return result;
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB $nearSphere query failed (${err.message}). Using live OSM / mock geospatial fallback.`);
    }

    // Try OSM / Mock provider
    const fallbackTrails = await this.osmProvider.getNearbyTrails(params);
    const result = {
      trails: fallbackTrails,
      total: fallbackTrails.length,
      userCoordinates: [params.longitude, params.latitude],
      meta: {
        provider: this.osmProvider.providerName,
        disclaimer: 'Geospatial distances are calculated as straight-line distances to trailheads.',
      },
    };

    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

  async getTrailById(idOrSlug: string) {
    let trail: any = null;

    try {
      if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        trail = await this.trailModel.findById(idOrSlug).lean().exec();
      }
      if (!trail) {
        trail = await this.trailModel.findOne({ slug: idOrSlug }).lean().exec();
      }
    } catch (err: any) {
      this.logger.debug(`Error querying Mongo for trail ${idOrSlug}: ${err.message}`);
    }

    if (!trail) {
      trail = await this.mockProvider.getTrailById(idOrSlug);
    }

    if (!trail) {
      throw new NotFoundException(`Trail with ID or slug "${idOrSlug}" not found`);
    }

    return {
      ...trail,
      safetyDisclaimer:
        'IMPORTANT SAFETY NOTICE: Hiking involves inherent environmental and physical risks. Mountain weather can change abruptly. Inform someone before your hike, stay on marked routes, carry proper hydration, and verify local permits/closures.',
    };
  }

  async getFilterOptions() {
    try {
      const [regions, difficulties, terrains, tags] = await Promise.all([
        this.trailModel.distinct('region').exec(),
        this.trailModel.distinct('difficulty').exec(),
        this.trailModel.distinct('terrains').exec(),
        this.trailModel.distinct('tags').exec(),
      ]);

      return {
        regions: regions.filter(Boolean),
        difficulties: difficulties.filter(Boolean),
        terrains: terrains.filter(Boolean),
        tags: tags.filter(Boolean),
      };
    } catch {
      return {
        regions: ['Delhi NCR', 'Himachal Pradesh', 'Maharashtra', 'Uttarakhand'],
        difficulties: ['Easy', 'Moderate', 'Hard', 'Expert'],
        terrains: ['Forest', 'Mountain', 'Rocky', 'Waterfall', 'Desert', 'Alpine', 'Meadow', 'River'],
        tags: ['Dog-Friendly', 'Family-Friendly', 'Scenic', 'Waterfall', 'Camping', 'Sunrise/Sunset', 'River View', 'Wildlife'],
      };
    }
  }

  async getFeaturedTrails() {
    return this.searchTrails({ limit: 6, sortBy: 'rating', sortOrder: 'desc' });
  }
}
