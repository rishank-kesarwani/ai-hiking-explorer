import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Public()
  @Get('forecast')
  @ApiOperation({ summary: 'Get current weather and 7-day forecast for GPS coordinates' })
  @ApiQuery({ name: 'lat', type: Number, example: 28.5583 })
  @ApiQuery({ name: 'lon', type: Number, example: 77.1264 })
  @ApiResponse({ status: 200, description: 'Weather forecast retrieved' })
  async getForecast(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
  ) {
    const parsedLat = parseFloat(lat) || 28.5583;
    const parsedLon = parseFloat(lon) || 77.1264;
    return this.weatherService.getWeatherForLocation(parsedLat, parsedLon);
  }
}
