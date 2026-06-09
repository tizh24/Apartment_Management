import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { SalesCommandService } from "./commands/sales-command.service";
import { SalesQueryService } from "./queries/sales-query.service";
import { SalesRepository } from "./repositories/sales.repository";
import { SalesController } from "./sales.controller";

@Module({
  imports: [AuthModule],
  controllers: [SalesController],
  providers: [SalesRepository, SalesCommandService, SalesQueryService],
})
export class SalesModule {}
