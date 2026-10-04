export interface WeatherForecast {
  temperatureC: number;
  feelsLikeC: number;
  condition: string;
  conditionCode: number;
  humidityPercent: number;
  windSpeedKmh: number;
  precipitationProbabilityPercent: number;
  uvIndex: number;
  sunriseTime: string;
  sunsetTime: string;
  isHazardous: boolean;
  hazardWarnings: string[];
  hourlyForecast: Array<{
    time: string;
    temperatureC: number;
    condition: string;
    precipitationProbability: number;
  }>;
  dailyForecast: Array<{
    date: string;
    tempMaxC: number;
    tempMinC: number;
    condition: string;
    precipitationProbability: number;
    sunrise: string;
    sunset: string;
  }>;
  provider: string;
  isLiveProvider: boolean;
  fetchedAt: string;
  disclaimer: string;
}

export interface IWeatherProvider {
  readonly providerName: string;
  readonly isLive: boolean;
  getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast>;
}
