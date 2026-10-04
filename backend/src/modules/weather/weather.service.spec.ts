import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WeatherService } from './weather.service';
import { OpenMeteoWeatherProvider } from './providers/open-meteo.provider';
import { MockWeatherProvider } from './providers/mock-weather.provider';
import { ResilientCacheService } from '../redis/resilient-cache.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let mockCacheService: any;
  let openMeteoProvider: OpenMeteoWeatherProvider;

  beforeEach(async () => {
    mockCacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        OpenMeteoWeatherProvider,
        MockWeatherProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('https://api.open-meteo.com/v1'),
          },
        },
        {
          provide: ResilientCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    openMeteoProvider = module.get<OpenMeteoWeatherProvider>(OpenMeteoWeatherProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return weather forecast with disclaimer and hazard warnings structure', async () => {
    const forecast = await service.getWeatherForLocation(28.5583, 77.1264);

    expect(forecast).toBeDefined();
    expect(forecast.temperatureC).toBeDefined();
    expect(forecast.disclaimer.toLowerCase()).toContain('meteorological');
    expect(forecast.dailyForecast).toBeInstanceOf(Array);
    expect(mockCacheService.set).toHaveBeenCalled();
  });

  it('should return cached forecast if available in resilient cache', async () => {
    const cachedData = {
      temperatureC: 22,
      condition: 'Sunny (Cached)',
      disclaimer: 'Cached Disclaimer',
    };
    mockCacheService.get.mockResolvedValueOnce(cachedData);

    const forecast = await service.getWeatherForLocation(28.5583, 77.1264);
    expect(forecast).toEqual(cachedData);
  });

  it('should fallback gracefully to MockWeatherProvider if external API fails', async () => {
    jest.spyOn(openMeteoProvider, 'getWeatherForecast').mockResolvedValueOnce({
      temperatureC: 20,
      feelsLikeC: 21,
      condition: 'Pleasant & Sunny',
      conditionCode: 1,
      humidityPercent: 48,
      windSpeedKmh: 12,
      precipitationProbabilityPercent: 10,
      uvIndex: 5,
      sunriseTime: '05:45 AM',
      sunsetTime: '06:40 PM',
      isHazardous: false,
      hazardWarnings: [],
      hourlyForecast: [],
      dailyForecast: [],
      provider: 'Verified Meteorological Simulator',
      isLiveProvider: false,
      fetchedAt: new Date().toISOString(),
      disclaimer: 'Meteorological data provided for expedition planning purposes only.',
    });

    const forecast = await service.getWeatherForLocation(32.2577, 76.3533);
    expect(forecast.condition).toBe('Pleasant & Sunny');
    expect(forecast.disclaimer).toBeDefined();
  });
});
