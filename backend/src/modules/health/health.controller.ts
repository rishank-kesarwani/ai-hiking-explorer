import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'System health check (Render probe endpoint)' })
  @ApiResponse({ status: 200, description: 'Service health details' })
  getHealth() {
    return this.healthService.checkHealth();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Root API information' })
  @ApiResponse({ status: 200, description: 'API status overview' })
  getRoot() {
    return this.healthService.getRoot();
  }
}
