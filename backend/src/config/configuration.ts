export default () => {
  const port = parseInt(process.env.PORT || '4000', 10);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return {
    port,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl,
    corsOrigins: [
      frontendUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://hiking-explorer.rishankkesharwani.com',
      /^https:\/\/.*\.vercel\.app$/,
    ],
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hiking-explorer',
    },
    redis: {
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    },
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_change_in_production_hiking_2026',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_change_in_production_hiking_2026',
      accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    },
    aiPlatform: {
      url: process.env.AI_PLATFORM_URL || '',
      apiKey: process.env.AI_PLATFORM_HIKING_API_KEY || process.env.AI_PLATFORM_API_KEY || '',
      timeoutMs: parseInt(process.env.AI_PLATFORM_TIMEOUT_MS || '15000', 10),
    },
    notificationService: {
      url: process.env.NOTIFICATION_SERVICE_URL || '',
      apiKey: process.env.NOTIFICATION_HIKING_API_KEY || process.env.NOTIFICATION_SERVICE_API_KEY || '',
      timeoutMs: parseInt(process.env.NOTIFICATION_SERVICE_TIMEOUT_MS || '10000', 10),
    },
    trailProvider: {
      baseUrl: process.env.TRAIL_PROVIDER_BASE_URL || 'https://api.overpass-api.de/api',
      apiKey: process.env.TRAIL_PROVIDER_API_KEY || '',
    },
    weatherProvider: {
      baseUrl: process.env.WEATHER_API_BASE_URL || 'https://api.open-meteo.com/v1',
      apiKey: process.env.WEATHER_API_KEY || '',
    },
    publicAccessEnabled: process.env.PUBLIC_ACCESS_ENABLED !== 'false',
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
  };
};
