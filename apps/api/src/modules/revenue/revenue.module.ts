import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { RevenueCommandService } from "./commands/revenue-command.service";
import { RevenueQueryService } from "./queries/revenue-query.service";
import { RevenueController } from "./revenue.controller";
import { RevenueRepository } from "./repositories/revenue.repository";

@Module({
  imports: [AuthModule],
  controllers: [RevenueController],
  providers: [RevenueRepository, RevenueCommandService, RevenueQueryService],
})
export class RevenueModule {}
