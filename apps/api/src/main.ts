import "reflect-metadata";

import cors from "cors";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module";
import { setupSwagger } from "./swagger";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule) as NestExpressApplication;

  app.use(cors({
    origin: true,
    credentials: true,
  }));

  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);

  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.APP_HOST ?? "0.0.0.0";

  await app.listen(port, host);
  console.log(`API is running on http://${host}:${port}/api/v1`);
}

void bootstrap();
