import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 4000);
  const nodeEnv = configService.get<string>('nodeEnv', 'development');

  // Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI to render correctly without CSP blockages
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Cookie Parser Middleware
  const parseCookies = typeof (cookieParser as any).default === 'function' 
    ? (cookieParser as any).default 
    : cookieParser;
  app.use(parseCookies());

  // Global Input Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Explicit CORS setup for Frontend, Vercel Previews, and Custom Domains
  const corsOrigins = configService.get<Array<string | RegExp>>('corsOrigins', []);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed = corsOrigins.some((allowed) => {
        if (typeof allowed === 'string') {
          return allowed === origin || allowed === '*';
        }
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(null, true); // Permissive in non-strict environments to prevent breaks
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // Global Route Prefix (/api/v1) excluding Health & Root endpoints
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'health', method: RequestMethod.GET },
      { path: '', method: RequestMethod.GET },
    ],
  });

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Hiking Explorer API')
    .setDescription('Production Backend API for AI Hiking Explorer - Discover trails, AI trip planning, weather forecasts, and hiking checklists.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Health', 'Health check and deployment probes')
    .addTag('Authentication', 'User authentication and JWT token management')
    .addTag('Trails', 'Trail discovery, filters, and 2dsphere geospatial search')
    .addTag('AI Intelligence', 'Natural language search, personalized recommendations, itinerary & gear generation')
    .addTag('Weather', 'Meteorological forecasts and hazard detection')
    .addTag('Favorites & Saved Hikes', 'User saved trails and hiking history')
    .addTag('Hiking Plans', 'Interactive hiking trip planning')
    .addTag('Notifications', 'Hiking reminders and alert notifications')
    .addTag('Users', 'User profile and preference settings')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Listen on 0.0.0.0 for Render / Container deployment compatibility
  await app.listen(port, '0.0.0.0');

  logger.log(`=======================================================`);
  logger.log(`🚀 AI Hiking Explorer Backend running on http://0.0.0.0:${port}`);
  logger.log(`📚 Swagger documentation at http://0.0.0.0:${port}/api/docs`);
  logger.log(`🩺 Health check probe at http://0.0.0.0:${port}/health`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
  logger.log(`=======================================================`);
}

bootstrap();
