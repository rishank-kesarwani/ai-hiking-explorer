import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ResilientCacheService } from './resilient-cache.service';

@Global()
@Module({
  providers: [RedisService, ResilientCacheService],
  exports: [RedisService, ResilientCacheService],
})
export class RedisModule {}
