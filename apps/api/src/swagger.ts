import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

export function setupSwagger(app: NestFastifyApplication): void {
  const configService = app.get(ConfigService);
  const swaggerEnabled = configService.get<boolean>("app.swaggerEnabled");

  if (!swaggerEnabled) {
    return;
  }

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(configService.get<string>("app.name") ?? "Apartment Management API")
      .setVersion("1.0.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste access token returned by POST /api/v1/auth/login",
        },
        "access-token",
      )
      .build(),
  );

  SwaggerModule.setup("docs", app, document);
}
