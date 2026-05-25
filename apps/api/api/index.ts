import "reflect-metadata";

import cors from "cors";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "../src/app.module";
import { setupSwagger } from "../src/swagger";

let nestApp: NestExpressApplication | null = null;

async function bootstrap() {
    if (!nestApp) {
        nestApp = await NestFactory.create(AppModule) as NestExpressApplication;

        nestApp.use(cors({
            origin: true,
            credentials: true,
        }));

        nestApp.setGlobalPrefix("api");
        nestApp.enableVersioning({
            type: VersioningType.URI,
            defaultVersion: "1",
        });

        nestApp.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
            }),
        );

        setupSwagger(nestApp);

        await nestApp.init();
    }
    return nestApp.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
    try {
        const app = await bootstrap();
        app(req, res);
    } catch (error) {
        console.error('[Serverless Error]', error);
        if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: 'Internal Server Error',
                ...(process.env.NODE_ENV !== 'production' && { details: String(error) })
            }));
        }
    }
}