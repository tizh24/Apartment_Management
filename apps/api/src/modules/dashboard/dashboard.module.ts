import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardQueryService } from "./queries/dashboard-query.service";
import { DashboardRepository } from "./repositories/dashboard.repository";

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [DashboardRepository, DashboardQueryService],
})
export class DashboardModule {}
