import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HikingPlan, HikingPlanDocument } from '../hiking-plans/schemas/hiking-plan.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private reminderInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectModel(HikingPlan.name) private readonly planModel: Model<HikingPlanDocument>,
    private readonly notifService: NotificationsService,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.startBackgroundScheduler();
  }

  private startBackgroundScheduler() {
    this.logger.log('Starting resilient background job scheduler...');

    // Run check every 10 minutes
    this.reminderInterval = setInterval(() => {
      this.checkUpcomingHikesAndNotify().catch((err) =>
        this.logger.error(`Error executing background hike reminder job: ${err.message}`),
      );
    }, 600000);

    // Run first check after 10 seconds
    setTimeout(() => {
      this.checkUpcomingHikesAndNotify().catch(() => {});
    }, 10000);
  }

  async checkUpcomingHikesAndNotify() {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const upcomingPlans = await this.planModel
        .find({
          userId: { $exists: true, $ne: null },
          scheduledDate: { $gte: now, $lte: in24Hours },
          status: 'Upcoming',
        })
        .populate('trailId')
        .exec();

      for (const plan of upcomingPlans) {
        if (!plan.userId) continue;

        const trail = plan.trailId as any;
        const trailName = trail?.title || 'your scheduled trail';

        await this.notifService.createNotification({
          userId: plan.userId.toString(),
          title: `Upcoming Hike Reminder: ${trailName}`,
          message: `Your hike "${plan.title}" is scheduled for tomorrow at ${plan.targetStartTime}. Don't forget to pack your gear, check the weather forecast, and stay hydrated!`,
          type: NotificationType.UPCOMING_HIKE_REMINDER,
          trailId: trail?._id?.toString(),
          planId: plan._id.toString(),
        });
      }
    } catch (err: any) {
      this.logger.debug(`Background hike notification sweep encountered: ${err.message}`);
    }
  }

  onModuleDestroy() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }
  }
}
