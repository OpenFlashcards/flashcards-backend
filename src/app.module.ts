import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule, // Core database module
    UserModule, // User management module
    // Add your feature modules here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
