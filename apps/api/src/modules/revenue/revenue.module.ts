import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { RevenueController } from "./revenue.controller";
import { RevenueService } from "./revenue.service";

@Module({
  imports: [AuthModule],
  controllers: [RevenueController],
  providers: [RevenueService],
})
export class RevenueModule {}
