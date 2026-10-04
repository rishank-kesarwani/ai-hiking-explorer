import { Injectable, Logger } from '@nestjs/common';
import { OpenMeteoWeatherProvider } from './providers/open-meteo.provider';
import { ResilientCacheService } from '../redis/resilient-cache.service';
import { WeatherForecast } from './providers/weather.interface';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    private readonly openMeteoProvider: OpenMeteoWeatherProvider,
    private readonly cacheService: ResilientCacheService,
  ) {}

  async getWeatherForLocation(lat: number, lon: number): Promise<WeatherForecast> {
    const roundedLat = Math.round(lat * 100) / 100;
    const roundedLon = Math.round(lon * 100) / 100;
    const cacheKey = `weather:${roundedLat}:${roundedLon}`;

    const cached = await this.cacheService.get<WeatherForecast>(cacheKey);
    if (cached) {
      return cached;
    }

    const forecast = await this.openMeteoProvider.getWeatherForecast(lat, lon);

    // Cache for 30 minutes (1800 seconds)
    await this.cacheService.set(cacheKey, forecast, 1800);
    return forecast;
  }
}
