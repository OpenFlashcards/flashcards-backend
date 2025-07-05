import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DeckModule } from './deck/deck.module';
import { CardModule } from './card/card.module';
import { JwtAuthGuard } from './auth/guards';

@Module({
  imports: [
    ConfigModule,
    PrismaModule, // Core database module
    UserModule, // User management module
    AuthModule, // Authentication module
    DeckModule, // Deck management module
    CardModule, // Card management module
    // Add your feature modules here
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
