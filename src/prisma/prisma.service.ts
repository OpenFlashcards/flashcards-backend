import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.databaseUrl,
        },
      },
      // Disable Prisma's built-in logging to use only NestJS logger
      log: [],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');

      // Log connection pool info
      this.logger.log('Database connection pool initialized');

      // Setup custom logging middleware for better integration
      this.setupCustomLogging();
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from database');
    } catch (error) {
      this.logger.error('Failed to disconnect from database:', error);
    }
  }

  /**
   * Cleanup function for testing environments
   * This method can be used to clean up the database during tests
   */
  async cleanDatabase() {
    if (!this.configService.isTest) {
      throw new Error('cleanDatabase can only be called in test environment');
    }

    // This is a basic implementation - you might want to customize this
    // based on your specific database schema
    const tablenames = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await this.$executeRawUnsafe(
            `TRUNCATE TABLE "public"."${tablename}" CASCADE;`,
          );
        } catch (error) {
          this.logger.warn(`Failed to truncate table ${tablename}:`, error);
        }
      }
    }
  }

  /**
   * Execute a function within a transaction
   * This is a convenience method for handling transactions
   */
  async executeTransaction<T>(
    fn: (prisma: PrismaService) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (prisma) => {
      return fn(prisma as PrismaService);
    });
  }

  /**
   * Setup custom logging using Prisma middleware
   * This integrates better with NestJS logger than event handlers
   */
  private setupCustomLogging() {
    this.$use(async (params, next) => {
      const before = Date.now();

      if (this.configService.isDevelopment) {
        this.logger.debug(
          `[PRISMA] ${params.model}.${params.action} - Args: ${JSON.stringify(
            params.args,
          )}`,
        );
      }

      try {
        const result = await next(params);
        const after = Date.now();

        if (this.configService.isDevelopment) {
          this.logger.debug(
            `[PRISMA] ${params.model}.${params.action} completed in ${
              after - before
            }ms`,
          );
        }

        return result;
      } catch (error) {
        const after = Date.now();
        this.logger.error(
          `[PRISMA] ${params.model}.${params.action} failed in ${
            after - before
          }ms: ${error.message}`,
        );
        throw error;
      }
    });

    // Log database connection pool info through NestJS logger
    if (this.configService.isDevelopment) {
      this.logger.log('Prisma middleware configured for query logging');
    }
  }
}
