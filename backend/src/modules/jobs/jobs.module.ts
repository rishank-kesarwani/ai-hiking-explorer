import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsService } from './jobs.service';
import { HikingPlan, HikingPlanSchema } from '../hiking-plans/schemas/hiking-plan.schema';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HikingPlan.name, schema: HikingPlanSchema }]),
    NotificationsModule,
  ],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
