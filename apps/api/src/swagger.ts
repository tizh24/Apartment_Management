import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";

export function setupSwagger(app: NestExpressApplication): void {
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
          description: "Paste access token here. Swagger will send it as Authorization: Bearer <token>.",
        },
        "bearer",
      )
      .build(),
  );

  SwaggerModule.setup("docs", app, document, {
    ui: false,
  });

  const appName = configService.get<string>("app.name") ?? "Apartment Management API";
  const swaggerHtml = buildSwaggerHtml(appName);

  for (const path of ["/docs", "/docs/"]) {
    app.use(path, (_request: ExpressRequest, response: ExpressResponse) => {
      response.type("text/html").send(swaggerHtml);
    });
  }
}

function buildSwaggerHtml(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} - Swagger UI</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html { box-sizing: border-box; overflow-y: scroll; }
      *, *:before, *:after { box-sizing: inherit; }
      body { margin: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: "/docs-json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          persistAuthorization: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "StandaloneLayout",
        });
      };
    </script>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
