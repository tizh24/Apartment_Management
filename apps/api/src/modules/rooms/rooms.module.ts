import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { RoomsCommandService } from "./commands/rooms-command.service";
import { RoomsQueryService } from "./queries/rooms-query.service";
import { RoomsRepository } from "./repositories/rooms.repository";
import { RoomsController } from "./rooms.controller";

@Module({
  imports: [AuthModule],
  controllers: [RoomsController],
  providers: [RoomsRepository, RoomsCommandService, RoomsQueryService],
})
export class RoomsModule {}
