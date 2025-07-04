import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export interface CorsConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  optionsSuccessStatus: number;
  maxAge: number;
}

export interface EnvironmentConfig {
  // Required environment variables
  DATABASE_URL: string;

  // Optional environment variables
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  PORT?: string;

  // CORS Configuration
  CORS_ORIGIN?: string;
  CORS_METHODS?: string;
  CORS_ALLOWED_HEADERS?: string;
  CORS_CREDENTIALS?: string;
  CORS_OPTIONS_SUCCESS_STATUS?: string;
  CORS_MAX_AGE?: string;

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
      'CORS_METHODS',
      'CORS_ALLOWED_HEADERS',
      'CORS_CREDENTIALS',
      'CORS_OPTIONS_SUCCESS_STATUS',
      'CORS_MAX_AGE',
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
      CORS_METHODS:
        this.nestConfigService.get<string>('CORS_METHODS') ||
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      CORS_ALLOWED_HEADERS:
        this.nestConfigService.get<string>('CORS_ALLOWED_HEADERS') ||
        'Origin,X-Requested-With,Content-Type,Accept,Authorization',
      CORS_CREDENTIALS:
        this.nestConfigService.get<string>('CORS_CREDENTIALS') || 'false',
      CORS_OPTIONS_SUCCESS_STATUS:
        this.nestConfigService.get<string>('CORS_OPTIONS_SUCCESS_STATUS') ||
        '200',
      CORS_MAX_AGE:
        this.nestConfigService.get<string>('CORS_MAX_AGE') || '86400',
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

  /**
   * Get complete CORS configuration object
   * @returns CorsConfig object ready for NestJS enableCors()
   */
  get corsConfig(): CorsConfig {
    const origin = this.parseOrigins(this.config.CORS_ORIGIN || '*');
    const methods = this.parseMethods(
      this.config.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    const allowedHeaders = this.parseHeaders(
      this.config.CORS_ALLOWED_HEADERS ||
        'Origin,X-Requested-With,Content-Type,Accept,Authorization',
    );
    const credentials = this.parseBoolean(
      this.config.CORS_CREDENTIALS || 'false',
    );
    const optionsSuccessStatus = parseInt(
      this.config.CORS_OPTIONS_SUCCESS_STATUS || '200',
      10,
    );
    const maxAge = parseInt(this.config.CORS_MAX_AGE || '86400', 10);

    return {
      origin,
      methods,
      allowedHeaders,
      credentials,
      optionsSuccessStatus,
      maxAge,
    };
  }

  /**
   * Parse CORS origins - handles single origin, multiple origins, or boolean
   */
  private parseOrigins(originString: string): string | string[] | boolean {
    if (originString === 'true') return true;
    if (originString === 'false') return false;
    if (originString === '*') return '*';

    // Check if it contains multiple origins separated by comma
    if (originString.includes(',')) {
      return originString.split(',').map((origin) => origin.trim());
    }

    return originString;
  }

  /**
   * Parse CORS methods from comma-separated string
   */
  private parseMethods(methodsString: string): string[] {
    return methodsString
      .split(',')
      .map((method) => method.trim().toUpperCase());
  }

  /**
   * Parse CORS headers from comma-separated string
   */
  private parseHeaders(headersString: string): string[] {
    return headersString.split(',').map((header) => header.trim());
  }

  /**
   * Parse boolean string values
   */
  private parseBoolean(booleanString: string): boolean {
    return booleanString.toLowerCase() === 'true';
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
