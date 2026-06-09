import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { ContractsCommandService } from "./commands/contracts-command.service";
import { ContractsController } from "./contracts.controller";
import { ContractsQueryService } from "./queries/contracts-query.service";
import { ContractsRepository } from "./repositories/contracts.repository";

@Module({
  imports: [AuthModule],
  controllers: [ContractsController],
  providers: [
    ContractsRepository,
    ContractsCommandService,
    ContractsQueryService,
  ],
})
export class ContractsModule {}
