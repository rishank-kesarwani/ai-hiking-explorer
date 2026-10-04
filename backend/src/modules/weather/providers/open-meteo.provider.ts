import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IWeatherProvider, WeatherForecast } from './weather.interface';
import { MockWeatherProvider } from './mock-weather.provider';

@Injectable()
export class OpenMeteoWeatherProvider implements IWeatherProvider {
  private readonly logger = new Logger(OpenMeteoWeatherProvider.name);
  readonly providerName = 'Open-Meteo Global Weather API';
  readonly isLive = true;

  constructor(
    private readonly configService: ConfigService,
    private readonly mockProvider: MockWeatherProvider,
  ) {}

  async getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast> {
    const baseUrl = this.configService.get<string>('weatherProvider.baseUrl') || 'https://api.open-meteo.com/v1';

    try {
      const url = `${baseUrl}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max&timezone=auto`;

      const response = await axios.get(url, { timeout: 4000 });
      const data = response.data;

      if (data && data.current) {
        const current = data.current;
        const conditionDesc = this.mapWeatherCode(current.weather_code);

        const hazardWarnings: string[] = [];
        let isHazardous = false;

        if (current.temperature_2m > 38) {
          isHazardous = true;
          hazardWarnings.push('High Heat Warning: Risk of dehydration and heat exhaustion. Hike early or carry >3L fluids.');
        } else if (current.temperature_2m < 0) {
          isHazardous = true;
          hazardWarnings.push('Freezing Conditions: Risk of ice on trail and hypothermia. Bring winter insulation and traction spikes.');
        }

        if (current.wind_speed_10m > 45) {
          isHazardous = true;
          hazardWarnings.push('Severe Ridge Wind: Gusts exceeding 45 km/h. Avoid exposed cliffs and narrow ridges.');
        }

        if (current.weather_code >= 95) {
          isHazardous = true;
          hazardWarnings.push('Thunderstorm & Lightning Hazard: Seek shelter in lower valleys and stay clear of high summits.');
        } else if (current.weather_code >= 61 && current.weather_code <= 67) {
          hazardWarnings.push('Rain & Slippery Rocks: Use trekking poles and waterproof traction gear.');
        }

        const hourlyForecast = (data.hourly?.time || []).slice(0, 8).map((timeStr: string, idx: number) => ({
          time: timeStr,
          temperatureC: data.hourly.temperature_2m[idx] ?? current.temperature_2m,
          condition: this.mapWeatherCode(data.hourly.weather_code?.[idx] ?? 0),
          precipitationProbability: data.hourly.precipitation_probability?.[idx] ?? 0,
        }));

        const dailyForecast = (data.daily?.time || []).slice(0, 7).map((dateStr: string, idx: number) => ({
          date: dateStr,
          tempMaxC: data.daily.temperature_2m_max?.[idx] ?? current.temperature_2m + 3,
          tempMinC: data.daily.temperature_2m_min?.[idx] ?? current.temperature_2m - 4,
          condition: this.mapWeatherCode(data.daily.weather_code?.[idx] ?? 0),
          precipitationProbability: data.daily.precipitation_probability_max?.[idx] ?? 0,
          sunrise: data.daily.sunrise?.[idx] || '06:00 AM',
          sunset: data.daily.sunset?.[idx] || '06:30 PM',
        }));

        return {
          temperatureC: Math.round(current.temperature_2m),
          feelsLikeC: Math.round(current.apparent_temperature),
          condition: conditionDesc,
          conditionCode: current.weather_code,
          humidityPercent: current.relative_humidity_2m,
          windSpeedKmh: Math.round(current.wind_speed_10m),
          precipitationProbabilityPercent: data.daily?.precipitation_probability_max?.[0] || 0,
          uvIndex: data.daily?.uv_index_max?.[0] || 5,
          sunriseTime: data.daily?.sunrise?.[0] || '06:00 AM',
          sunsetTime: data.daily?.sunset?.[0] || '06:30 PM',
          isHazardous,
          hazardWarnings,
          hourlyForecast,
          dailyForecast,
          provider: 'Open-Meteo Global Weather API',
          isLiveProvider: true,
          fetchedAt: new Date().toISOString(),
          disclaimer: 'Weather forecast is retrieved from third-party meteorological providers. Mountain microclimates can change unpredictably. Never rely solely on digital forecasts for life safety.',
        };
      }
    } catch (err: any) {
      this.logger.warn(`Live Open-Meteo request failed (${err.message}). Using resilient mock weather provider.`);
    }

    return this.mockProvider.getWeatherForecast(lat, lon);
  }

  private mapWeatherCode(code: number): string {
    switch (code) {
      case 0:
        return 'Clear Sky';
      case 1:
        return 'Mainly Clear';
      case 2:
        return 'Partly Cloudy';
      case 3:
        return 'Overcast';
      case 45:
      case 48:
        return 'Fog / Mist';
      case 51:
      case 53:
      case 55:
        return 'Light Drizzle';
      case 61:
      case 63:
      case 65:
        return 'Rain';
      case 71:
      case 73:
      case 75:
        return 'Snowfall';
      case 80:
      case 81:
      case 82:
        return 'Rain Showers';
      case 95:
      case 96:
      case 99:
        return 'Thunderstorm';
      default:
        return 'Clear / Mild';
    }
  }
}
