import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { NotificationServiceClient } from './providers/notification-service.client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private readonly notifModel: Model<NotificationDocument>,
    private readonly client: NotificationServiceClient,
  ) {}

  async createNotification(params: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    trailId?: string;
    planId?: string;
    metadata?: Record<string, any>;
  }) {
    const notif = await this.notifModel.create({
      userId: new Types.ObjectId(params.userId),
      title: params.title,
      message: params.message,
      type: params.type || NotificationType.UPCOMING_HIKE_REMINDER,
      trailId: params.trailId ? new Types.ObjectId(params.trailId) : undefined,
      planId: params.planId ? new Types.ObjectId(params.planId) : undefined,
      metadata: params.metadata || {},
      isRead: false,
    });

    // Fire external notification in background
    this.client.sendExternalNotification({
      userId: params.userId,
      title: params.title,
      body: params.message,
      type: params.type || NotificationType.UPCOMING_HIKE_REMINDER,
      metadata: params.metadata,
    }).catch((err) => this.logger.debug(`Background push error: ${err.message}`));

    return notif;
  }

  async getUserNotifications(userId: string) {
    return this.notifModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
      .exec();
  }

  async markAsRead(id: string, userId: string) {
    return this.notifModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { $set: { isRead: true } },
      { new: true },
    ).exec();
  }

  async markAllAsRead(userId: string) {
    await this.notifModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } },
    ).exec();
    return { success: true, message: 'All notifications marked as read' };
  }
}
