import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FavoritesService } from './favorites.service';
import { FavoriteTrail } from './schemas/favorite-trail.schema';
import { SavedHike } from './schemas/saved-hike.schema';
import { TrailsService } from '../trails/trails.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let mockFavoriteModel: any;
  let mockSavedHikeModel: any;

  beforeEach(async () => {
    mockFavoriteModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      create: jest.fn().mockResolvedValue({ _id: 'fav_1' }),
      findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'fav_1' }),
      }),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
    };

    mockSavedHikeModel = {
      create: jest.fn().mockResolvedValue({
        _id: 'save_1',
        populate: jest.fn().mockResolvedValue({ _id: 'save_1', title: 'Planned Hike' }),
      }),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
      findOneAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'save_1' }),
      }),
    };

    const mockTrailsService = {
      getTrailById: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        title: 'Aravalli Trail',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: TrailsService, useValue: mockTrailsService },
        { provide: getModelToken(FavoriteTrail.name), useValue: mockFavoriteModel },
        { provide: getModelToken(SavedHike.name), useValue: mockSavedHikeModel },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should toggle favorite on when not previously favorited', async () => {
    const result = await service.toggleFavorite('507f1f77bcf86cd799439011', 'aravalli-trail');
    expect(result.isFavorite).toBe(true);
    expect(mockFavoriteModel.create).toHaveBeenCalled();
  });

  it('should toggle favorite off when already favorited', async () => {
    mockFavoriteModel.findOne.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValueOnce({ _id: 'fav_existing' }),
    });

    const result = await service.toggleFavorite('507f1f77bcf86cd799439011', 'aravalli-trail');
    expect(result.isFavorite).toBe(false);
    expect(mockFavoriteModel.findByIdAndDelete).toHaveBeenCalled();
  });
});
