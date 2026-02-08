import * as path from 'path';
import { config } from 'dotenv';

// Load .env from cwd (repo root when run via "npm run dev:api") or apps/api
config({ path: path.resolve(process.cwd(), '.env') });
config({ path: path.resolve(process.cwd(), '../../.env') });

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? true, credentials: true });
  app.setGlobalPrefix('api');
  const port = process.env.PORT ?? 3001;

  // Swagger / OpenAPI documentation (disable in production via SWAGGER_ENABLED=false if desired)
  const swaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Matrimony API')
      .setDescription('API for the matrimony platform: auth, profiles, search, chat, subscription, admin.')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', in: 'header' },
        'JWT',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      jsonDocumentUrl: 'docs-json',
    });
    logger.log('Swagger UI: /api/docs, OpenAPI JSON: /api/docs-json');
  }

  await app.listen(port);
  logger.log(`API listening on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
