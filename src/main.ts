import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const port = configService.port;
    await app.listen(port);

    logger.log(`Application is running on port ${port}`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
