import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';

let app: any;

async function bootstrap() {
    if (!app) {
        app = await NestFactory.create(
            AppModule,
            new FastifyAdapter(),
        );

        await app.init();
    }

    return app;
}

export default async function handler(req: any, res: any) {
    const app = await bootstrap();

    app
        .getHttpAdapter()
        .getInstance()
        .server.emit('request', req, res);
}