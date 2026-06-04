import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { buildCorsOptions } from './config/cors.config';
import { HTTP_CONFIG } from './shared/constants/env-defaults.constants';
import { AppLogger } from './shared/infrastructure/logging/app-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(json({ limit: HTTP_CONFIG.BODY_LIMIT }));
  app.use(urlencoded({ extended: true, limit: HTTP_CONFIG.BODY_LIMIT }));

  app.setGlobalPrefix(HTTP_CONFIG.GLOBAL_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors(buildCorsOptions());

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
