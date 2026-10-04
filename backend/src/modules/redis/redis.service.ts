import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.initRedisClient();
  }

  private initRedisClient() {
    try {
      const redisUrl = this.configService.get<string>('redis.url');
      const host = this.configService.get<string>('redis.host', '127.0.0.1');
      const port = this.configService.get<number>('redis.port', 6379);
      const password = this.configService.get<string>('redis.password');

      const redisOptions: any = {
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 100, 3000);
          return delay;
        },
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
        connectTimeout: 4000,
      };

      if (redisUrl && redisUrl.trim() !== '') {
        this.client = new Redis(redisUrl, redisOptions);
        this.logger.log(`Initializing Redis client via REDIS_URL`);
      } else {
        if (password) {
          redisOptions.password = password;
        }
        this.client = new Redis({
          host,
          port,
          ...redisOptions,
        });
        this.logger.log(`Initializing Redis client via host: ${host}, port: ${port}`);
      }

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log('Successfully connected to Redis');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        this.logger.warn(`Redis connection error (fallback in-memory mode active): ${err.message}`);
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      // Attempt initial connection asynchronously without blocking server boot
      this.client.connect().catch((err) => {
        this.isConnected = false;
        this.logger.warn(`Initial Redis connection could not be established: ${err.message}. Operating in resilient fallback mode.`);
      });
    } catch (err: any) {
      this.isConnected = false;
      this.logger.warn(`Failed to initialize Redis client: ${err.message}. Resilient in-memory fallback will be used.`);
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isRedisConnected(): boolean {
    return this.isConnected && this.client !== null && this.client.status === 'ready';
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        this.client.disconnect();
      }
    }
  }
}
