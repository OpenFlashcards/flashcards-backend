import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export interface EnvironmentConfig {
  // Required environment variables
  DATABASE_URL: string;

  // Optional environment variables
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  PORT?: string;
  CORS_ORIGIN?: string;
  LOG_LEVEL?: string;
}

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);
  private config: EnvironmentConfig;

  constructor(private nestConfigService: NestConfigService) {
    this.config = this.validateAndLoadConfig();
  }

  private validateAndLoadConfig(): EnvironmentConfig {
    const requiredEnvVars = ['DATABASE_URL'];

    const optionalEnvVars = [
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'PORT',
      'CORS_ORIGIN',
      'LOG_LEVEL',
    ];

    const missingRequired: string[] = [];
    const missingOptional: string[] = [];

    // Check required environment variables
    for (const envVar of requiredEnvVars) {
      const value = this.nestConfigService.get<string>(envVar);
      if (!value) {
        missingRequired.push(envVar);
      }
    }

    // Check optional environment variables
    for (const envVar of optionalEnvVars) {
      const value = this.nestConfigService.get<string>(envVar);
      if (!value) {
        missingOptional.push(envVar);
      }
    }

    // Log missing optional variables as warnings
    if (missingOptional.length > 0) {
      this.logger.warn(
        `Missing optional environment variables: ${missingOptional.join(', ')}`,
      );
      this.logger.warn(
        'Application will continue with default values for these variables',
      );
    }

    // Fail if required variables are missing
    if (missingRequired.length > 0) {
      this.logger.error(
        `Missing required environment variables: ${missingRequired.join(', ')}`,
      );
      this.logger.error('Application cannot start without these variables');
      throw new Error(
        `Missing required environment variables: ${missingRequired.join(', ')}`,
      );
    }

    this.logger.log('All required environment variables are present');

    return {
      DATABASE_URL: this.nestConfigService.get<string>('DATABASE_URL')!,
      JWT_SECRET: this.nestConfigService.get<string>('JWT_SECRET'),
      JWT_EXPIRES_IN:
        this.nestConfigService.get<string>('JWT_EXPIRES_IN') || '7d',
      PORT: this.nestConfigService.get<string>('PORT') || '3000',
      CORS_ORIGIN: this.nestConfigService.get<string>('CORS_ORIGIN') || '*',
      LOG_LEVEL: this.nestConfigService.get<string>('LOG_LEVEL') || 'info',
    };
  }

  get databaseUrl(): string {
    // WARNING: Never expose this value through public APIs
    return this.config.DATABASE_URL;
  }

  get jwtSecret(): string | undefined {
    // WARNING: Never expose this value through public APIs
    return this.config.JWT_SECRET;
  }

  get port(): number {
    return parseInt(this.config.PORT || '3000', 10);
  }

  get jwtExpiresIn(): string {
    return this.config.JWT_EXPIRES_IN || '7d';
  }

  get corsOrigin(): string {
    return this.config.CORS_ORIGIN || '*';
  }

  get logLevel(): string {
    return this.config.LOG_LEVEL || 'info';
  }

  get isDevelopment(): boolean {
    return this.nestConfigService.get<string>('NODE_ENV') === 'development';
  }

  get isProduction(): boolean {
    return this.nestConfigService.get<string>('NODE_ENV') === 'production';
  }

  get isTest(): boolean {
    return this.nestConfigService.get<string>('NODE_ENV') === 'test';
  }
}
