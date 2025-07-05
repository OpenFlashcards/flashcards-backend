import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Enable CORS with configuration from ConfigService
    app.enableCors(configService.corsConfig);

    const port = configService.port;

    const config = new DocumentBuilder()
      .setTitle('Open Flashcards API')
      .setDescription('Open Flashcards API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addSecurityRequirements('JWT-auth')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    const document = documentFactory();
    SwaggerModule.setup('docs', app, documentFactory);

    // Export swagger.json file (only in development)
    if (process.env.NODE_ENV !== 'production') {
      const outputPath = join(process.cwd(), 'swagger.json');
      writeFileSync(outputPath, JSON.stringify(document, null, 2));
      logger.log(`Swagger JSON exported to: ${outputPath}`);
    }

    await app.listen(port);

    logger.log(`Application is running on port ${port}`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(
      `CORS enabled with origin: ${JSON.stringify(configService.corsConfig.origin)}`,
    );
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
