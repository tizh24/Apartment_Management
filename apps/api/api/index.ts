import { createConfiguredNestApp } from "../src/nest-app";
import type { NestExpressApplication } from "@nestjs/platform-express";

type ServerlessApp = ReturnType<ReturnType<NestExpressApplication["getHttpAdapter"]>["getInstance"]>;

let bootstrapPromise: Promise<ServerlessApp> | null = null;

async function bootstrap() {
    if (!bootstrapPromise) {
        bootstrapPromise = (async () => {
            const nestApp = await createConfiguredNestApp();
            await nestApp.init();

            return nestApp.getHttpAdapter().getInstance();
        })();
    }

    return bootstrapPromise;
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