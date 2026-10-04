import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { RedisModule } from './modules/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TrailsModule } from './modules/trails/trails.module';
import { WeatherModule } from './modules/weather/weather.module';
import { AiModule } from './modules/ai/ai.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { HikingPlansModule } from './modules/hiking-plans/hiking-plans.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodb.uri') || 'mongodb://127.0.0.1:27017/hiking-explorer',
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: (config.get<number>('rateLimit.ttl') || 60) * 1000,
          limit: config.get<number>('rateLimit.limit') || 100,
        },
      ],
    }),
    RedisModule,
    HealthModule,
    AuthModule,
    UsersModule,
    TrailsModule,
    WeatherModule,
    AiModule,
    FavoritesModule,
    HikingPlansModule,
    NotificationsModule,
    JobsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
