import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { ApartmentsCommandService } from "./commands/apartments-command.service";
import { ApartmentsController } from "./apartments.controller";
import { ApartmentsQueryService } from "./queries/apartments-query.service";
import { ApartmentsRepository } from "./repositories/apartments.repository";

@Module({
  imports: [AuthModule],
  controllers: [ApartmentsController],
  providers: [
    ApartmentsRepository,
    ApartmentsCommandService,
    ApartmentsQueryService,
  ],
})
export class ApartmentsModule {}
