import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

interface MemoryCacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class ResilientCacheService {
  private readonly logger = new Logger(ResilientCacheService.name);
  private readonly memoryCache = new Map<string, MemoryCacheEntry<any>>();

  constructor(private readonly redisService: RedisService) {
    // Cleanup expired memory cache items every 2 minutes
    setInterval(() => {
      this.cleanupMemoryCache();
    }, 120000);
  }

  async get<T>(key: string): Promise<T | null> {
    const client = this.redisService.getClient();

    if (this.redisService.isRedisConnected() && client) {
      try {
        const data = await client.get(key);
        if (data) {
          return JSON.parse(data) as T;
        }
        return null;
      } catch (err: any) {
        this.logger.debug(`Redis get failed for key "${key}", falling back to memory: ${err.message}`);
      }
    }

    // Resilient memory cache lookup
    const entry = this.memoryCache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    const client = this.redisService.getClient();

    if (this.redisService.isRedisConnected() && client) {
      try {
        await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (err: any) {
        this.logger.debug(`Redis set failed for key "${key}", writing to memory: ${err.message}`);
      }
    }

    // Resilient memory cache write
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    const client = this.redisService.getClient();

    if (this.redisService.isRedisConnected() && client) {
      try {
        await client.del(key);
      } catch (err: any) {
        this.logger.debug(`Redis del failed for key "${key}": ${err.message}`);
      }
    }

    this.memoryCache.delete(key);
  }

  async flushByPrefix(prefix: string): Promise<void> {
    // Memory cache prefix eviction
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }

    const client = this.redisService.getClient();
    if (this.redisService.isRedisConnected() && client) {
      try {
        const keys = await client.keys(`${prefix}*`);
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } catch (err: any) {
        this.logger.debug(`Redis flushByPrefix failed for "${prefix}": ${err.message}`);
      }
    }
  }

  private cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }
}
