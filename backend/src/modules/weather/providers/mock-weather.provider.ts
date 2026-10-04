import { Injectable } from '@nestjs/common';
import { IWeatherProvider, WeatherForecast } from './weather.interface';

@Injectable()
export class MockWeatherProvider implements IWeatherProvider {
  readonly providerName = 'Mock Meteorological Provider';
  readonly isLive = false;

  async getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast> {
    const isMountain = lat > 30.0;
    const baseTemp = isMountain ? 16 : 26;

    const hourly = [];
    const now = new Date();
    for (let i = 0; i < 24; i += 3) {
      const forecastTime = new Date(now.getTime() + i * 3600 * 1000);
      hourly.push({
        time: forecastTime.toISOString(),
        temperatureC: baseTemp + Math.sin(i / 3) * 4,
        condition: i > 12 ? 'Partly Cloudy' : 'Sunny',
        precipitationProbability: isMountain ? 20 : 5,
      });
    }

    const daily = [];
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(now.getTime() + d * 86400 * 1000);
      daily.push({
        date: dayDate.toISOString().split('T')[0],
        tempMaxC: baseTemp + 4,
        tempMinC: baseTemp - 6,
        condition: d === 3 ? 'Light Showers' : 'Clear & Sunny',
        precipitationProbability: d === 3 ? 45 : 10,
        sunrise: '05:45 AM',
        sunset: '06:40 PM',
      });
    }

    return {
      temperatureC: baseTemp,
      feelsLikeC: baseTemp + 1,
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
      hourlyForecast: hourly,
      dailyForecast: daily,
      provider: 'Verified Meteorological Simulator',
      isLiveProvider: false,
      fetchedAt: new Date().toISOString(),
      disclaimer: 'Meteorological data provided for expedition planning purposes only. Mountain weather conditions are subject to rapid localized shifts. Always monitor local park ranger announcements.',
    };
  }
}
