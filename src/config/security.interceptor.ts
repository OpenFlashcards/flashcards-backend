import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Security interceptor to prevent accidental exposure of sensitive configuration
 * values in API responses. This interceptor scans response objects and removes
 * any properties that might contain sensitive information.
 */
@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  private readonly sensitiveKeys = [
    'DATABASE_URL',
    'JWT_SECRET',
    'password',
    'secret',
    'key',
    'token',
    'api_key',
    'apiKey',
    'connectionString',
    'databaseUrl',
    'jwtSecret',
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.sanitizeResponse(data)));
  }

  private sanitizeResponse(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeResponse(item));
    }

    const sanitized = { ...data };

    for (const key of Object.keys(sanitized)) {
      // Check if key name suggests sensitive data
      if (this.isSensitiveKey(key)) {
        delete sanitized[key];
        continue;
      }

      // Recursively sanitize nested objects
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeResponse(sanitized[key]);
      }
    }

    return sanitized;
  }

  private isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.sensitiveKeys.some((sensitiveKey) =>
      lowerKey.includes(sensitiveKey.toLowerCase()),
    );
  }
}
