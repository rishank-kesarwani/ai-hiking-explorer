import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { MockWeatherProvider } from './providers/mock-weather.provider';
import { OpenMeteoWeatherProvider } from './providers/open-meteo.provider';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, MockWeatherProvider, OpenMeteoWeatherProvider],
  exports: [WeatherService, MockWeatherProvider, OpenMeteoWeatherProvider],
})
export class WeatherModule {}
