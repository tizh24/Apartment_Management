import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { appConfig } from "./config/app.config";
import { databaseConfig } from "./config/database.config";
import { validateEnv } from "./config/env.validation";
import { HealthModule } from "./modules/health/health.module";
import { DatabaseModule } from "./shared/database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [".env.local", ".env"],
      load: [appConfig, databaseConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
