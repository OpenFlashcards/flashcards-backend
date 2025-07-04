import { Injectable } from '@nestjs/common';
import { ConfigService } from './config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    const environment = this.configService.isProduction
      ? 'production'
      : 'development';

    return `Hello World! Running in ${environment} mode.`;
  }

  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.isProduction
        ? 'production'
        : 'development',
      // Never expose any configuration details in public APIs
      version: '1.0.0',
    };
  }
}
