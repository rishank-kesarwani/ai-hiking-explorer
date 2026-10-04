import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly redisService: RedisService,
  ) {}

  checkHealth() {
    const isMongoConnected = this.mongoConnection.readyState === 1;
    const isRedisConnected = this.redisService.isRedisConnected();
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      status: 'ok',
      service: 'ai-hiking-explorer-backend',
      timestamp: new Date().toISOString(),
      uptime: `${uptimeSeconds}s`,
      database: {
        mongodb: isMongoConnected ? 'connected' : 'disconnected',
        readyState: this.mongoConnection.readyState,
      },
      cache: {
        redis: isRedisConnected ? 'connected' : 'disconnected/resilient_memory_fallback',
        isRedisAvailable: isRedisConnected,
      },
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getRoot() {
    return {
      service: 'AI Hiking Explorer API',
      status: 'online',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health',
      timestamp: new Date().toISOString(),
    };
  }
}
