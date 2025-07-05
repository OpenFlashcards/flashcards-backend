import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from '../src/app.module';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);

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

  const document = SwaggerModule.createDocument(app, config);
  const outputPath = join(process.cwd(), 'swagger.json');

  writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`Swagger JSON exported to: ${outputPath}`);

  await app.close();
}

generateSwagger().catch(console.error);
