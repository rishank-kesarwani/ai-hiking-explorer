import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationServiceClient {
  private readonly logger = new Logger(NotificationServiceClient.name);

  constructor(private readonly configService: ConfigService) {}

  async sendExternalNotification(payload: {
    userId: string;
    title: string;
    body: string;
    type: string;
    metadata?: Record<string, any>;
  }): Promise<boolean> {
    const url = this.configService.get<string>('notificationService.url');
    const apiKey = this.configService.get<string>('notificationService.apiKey');
    const timeoutMs = this.configService.get<number>('notificationService.timeoutMs') || 10000;

    if (!url || !apiKey || url.includes('example.com')) {
      this.logger.debug('External Notification Service not configured or in mock mode. Storing in-app notification directly.');
      return false;
    }

    try {
      await axios.post(
        `${url}/v1/send`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'X-Service-Client': 'ai-hiking-explorer-backend',
          },
          timeout: timeoutMs,
        },
      );
      return true;
    } catch (err: any) {
      this.logger.warn(`External Notification Service dispatch failed: ${err.message}. Relying on local database storage.`);
      return false;
    }
  }
}
