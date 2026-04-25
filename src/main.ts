import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsEnv = process.env.CORS_ORIGIN ?? '*';
  const origins =
    corsEnv === '*'
      ? true
      : corsEnv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
  app.enableCors({ origin: origins, credentials: true });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(`[twins-server] listening on :${port}`);
}
bootstrap();
