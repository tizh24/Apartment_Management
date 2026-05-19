import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
  name: process.env.APP_NAME ?? "Apartment Management API",
  host: process.env.APP_HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? 4000),
  swaggerEnabled: (process.env.SWAGGER_ENABLED ?? "true") === "true",
}));
