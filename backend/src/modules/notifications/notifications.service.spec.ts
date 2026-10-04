import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from './schemas/notification.schema';
import { NotificationServiceClient } from './providers/notification-service.client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockNotifModel: any;

  beforeEach(async () => {
    mockNotifModel = {
      create: jest.fn().mockImplementation((d) => ({
        ...d,
        _id: 'notif_1',
      })),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          {
            _id: 'notif_1',
            title: 'Upcoming Hike Reminder',
            message: 'Your hike starts tomorrow',
            isRead: false,
          },
        ]),
      }),
      findOneAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'notif_1', isRead: true }),
      }),
      updateMany: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 3 }),
      }),
    };

    const mockClient = {
      sendExternalNotification: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationServiceClient, useValue: mockClient },
        { provide: getModelToken(Notification.name), useValue: mockNotifModel },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and store in-app notification', async () => {
    const notif = await service.createNotification({
      userId: '507f1f77bcf86cd799439011',
      title: 'Weather Warning',
      message: 'High heat expected on Aravalli Trail',
      type: NotificationType.WEATHER_ALERT,
    });

    expect(notif).toBeDefined();
    expect(mockNotifModel.create).toHaveBeenCalled();
  });

  it('should mark all user notifications as read', async () => {
    const result = await service.markAllAsRead('507f1f77bcf86cd799439011');
    expect(result.success).toBe(true);
    expect(mockNotifModel.updateMany).toHaveBeenCalled();
  });
});
