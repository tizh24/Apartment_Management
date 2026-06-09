import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { CustomersCommandService } from "./commands/customers-command.service";
import { CustomersController } from "./customers.controller";
import { CustomersQueryService } from "./queries/customers-query.service";
import { CustomersRepository } from "./repositories/customers.repository";

@Module({
  imports: [AuthModule],
  controllers: [CustomersController],
  providers: [
    CustomersRepository,
    CustomersCommandService,
    CustomersQueryService,
  ],
})
export class CustomersModule {}
