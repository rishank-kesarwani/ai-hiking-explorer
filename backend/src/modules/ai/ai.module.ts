import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { HeuristicAiEngine } from './providers/heuristic-ai.engine';
import { AiPlatformClient } from './providers/ai-platform.client';
import { TrailsModule } from '../trails/trails.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TrailsModule, UsersModule],
  controllers: [AiController],
  providers: [AiService, HeuristicAiEngine, AiPlatformClient],
  exports: [AiService, HeuristicAiEngine, AiPlatformClient],
})
export class AiModule {}
