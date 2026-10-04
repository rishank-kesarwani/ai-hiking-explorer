import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { HeuristicAiEngine } from './heuristic-ai.engine';

@Injectable()
export class AiPlatformClient {
  private readonly logger = new Logger(AiPlatformClient.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly heuristicEngine: HeuristicAiEngine,
  ) {}

  async completePrompt(prompt: string, fallbackFn: () => any): Promise<any> {
    const aiPlatformUrl = this.configService.get<string>('aiPlatform.url');
    const apiKey = this.configService.get<string>('aiPlatform.apiKey');
    const timeoutMs = this.configService.get<number>('aiPlatform.timeoutMs') || 15000;

    if (!aiPlatformUrl || !apiKey || aiPlatformUrl.includes('example.com')) {
      this.logger.debug('AI Platform URL/Key not configured or in mock mode. Executing internal heuristic AI engine.');
      return fallbackFn();
    }

    try {
      const response = await axios.post(
        `${aiPlatformUrl}/v1/completions`,
        {
          model: 'gemini-1.5-pro',
          prompt,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'X-Service-Client': 'ai-hiking-explorer-backend',
          },
          timeout: timeoutMs,
        },
      );

      if (response.data && response.data.result) {
        return response.data.result;
      }
    } catch (err: any) {
      this.logger.warn(`AI Platform remote call failed (${err.message}). Resiliently executing fallback heuristic AI engine.`);
    }

    return fallbackFn();
  }
}
