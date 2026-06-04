import { z } from "zod";

const defaultSwaggerEnabled = process.env.NODE_ENV !== "production";

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return undefined;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: z.string().default("Apartment Management API"),
  APP_HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(4000),
  SWAGGER_ENABLED: z.preprocess(parseBoolean, z.boolean().default(defaultSwaggerEnabled)),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("1d"),
});

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  return envSchema.parse(config);
}
