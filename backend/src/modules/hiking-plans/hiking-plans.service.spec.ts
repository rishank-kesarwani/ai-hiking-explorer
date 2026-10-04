import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HikingPlansService } from './hiking-plans.service';
import { HikingPlan } from './schemas/hiking-plan.schema';
import { TrailsService } from '../trails/trails.service';
import { HeuristicAiEngine } from '../ai/providers/heuristic-ai.engine';

describe('HikingPlansService', () => {
  let service: HikingPlansService;
  let mockPlanModel: any;

  beforeEach(async () => {
    mockPlanModel = {
      create: jest.fn().mockImplementation((data) => ({
        ...data,
        _id: 'plan_1',
        populate: jest.fn().mockResolvedValue({ ...data, _id: 'plan_1' }),
      })),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      }),
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          title: 'Morning Hike Plan',
          checklistItems: [{ id: 'item_1', isChecked: false }],
          save: jest.fn().mockResolvedValue(true),
          populate: jest.fn().mockReturnThis(),
        }),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ _id: 'plan_1' }),
      }),
      findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(true),
      }),
    };

    const mockTrailsService = {
      getTrailById: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        title: 'Triund Ridge Trek',
        distanceKm: 9.5,
        elevationGainM: 950,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HikingPlansService,
        HeuristicAiEngine,
        { provide: TrailsService, useValue: mockTrailsService },
        { provide: getModelToken(HikingPlan.name), useValue: mockPlanModel },
      ],
    }).compile();

    service = module.get<HikingPlansService>(HikingPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create hiking plan with AI-generated timeline and checklist when not supplied', async () => {
    const plan = await service.createPlan(
      {
        title: 'Triund Expedition',
        trailIdOrSlug: 'triund-ridge-panoramic-trek',
        scheduledDate: '2026-10-20',
      },
      '507f1f77bcf86cd799439011',
    );

    expect(plan).toBeDefined();
    expect(mockPlanModel.create).toHaveBeenCalled();
  });
});
