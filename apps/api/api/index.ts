import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';

// Create a fresh app instance for each request in serverless environment
async function createAppHandler() {
    const adapter = new FastifyAdapter();
    const app = await NestFactory.create(AppModule, adapter);
    await app.init();
    return adapter.getInstance().server;
}

export default async function handler(req: any, res: any) {
    try {
        const server = await createAppHandler();

        // Route request through Fastify server
        server.emit('request', req, res);
    } catch (error) {
        console.error('[API Error]', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(
            JSON.stringify({
                error: 'Internal Server Error',
                ...(process.env.NODE_ENV !== 'production' && { details: String(error) })
            })
        );
    }
}