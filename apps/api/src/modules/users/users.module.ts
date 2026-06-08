import { Module } from "@nestjs/common";

import { UsersCommandService } from "./commands/users-command.service";
import { UsersQueryService } from "./queries/users-query.service";
import { UsersRepository } from "./repositories/users.repository";

@Module({
  providers: [UsersRepository, UsersCommandService, UsersQueryService],
  exports: [UsersCommandService, UsersQueryService],
})
export class UsersModule {}
