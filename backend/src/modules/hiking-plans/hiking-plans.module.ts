import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HikingPlansController } from './hiking-plans.controller';
import { HikingPlansService } from './hiking-plans.service';
import { HikingPlan, HikingPlanSchema } from './schemas/hiking-plan.schema';
import { TrailsModule } from '../trails/trails.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HikingPlan.name, schema: HikingPlanSchema }]),
    TrailsModule,
    AiModule,
  ],
  controllers: [HikingPlansController],
  providers: [HikingPlansService],
  exports: [HikingPlansService],
})
export class HikingPlansModule {}
