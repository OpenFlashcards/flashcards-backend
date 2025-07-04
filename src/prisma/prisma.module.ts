import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '../config';

/**
 * PrismaModule provides database access through PrismaService
 *
 * Usage:
 * - Import this module in feature modules that need database access
 * - PrismaService will be available for dependency injection
 *
 * Example:
 * @Module({
 *   imports: [PrismaModule],
 *   providers: [UserService],
 * })
 * export class UserModule {}
 */
@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
