import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { appConfig } from "./config/app.config";
import { authConfig } from "./config/auth.config";
import { databaseConfig } from "./config/database.config";
import { validateEnv } from "./config/env.validation";
import { AppController } from "./app.controller";
import { ApartmentsModule } from "./modules/apartments/apartments.module";
import { AuthModule } from "./modules/auth/auth.module";
import { HealthModule } from "./modules/health/health.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { UsersModule } from "./modules/users/users.module";
import { DatabaseModule } from "./shared/database/database.module";
import { DashboardModule } from './modules/dashboard/dashboard.module';
@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [".env.local", ".env"],
      load: [appConfig, authConfig, databaseConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ApartmentsModule,
    RoomsModule,
    HealthModule,
    DashboardModule,
  ],
})
export class AppModule { }
