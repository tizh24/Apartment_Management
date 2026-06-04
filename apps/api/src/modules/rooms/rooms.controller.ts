import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

import type { AuthenticatedRequestUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateMeterReadingDto } from "./dto/create-meter-reading.dto";
import { CreateRoomDto } from "./dto/create-room.dto";
import { QueryRoomsDto } from "./dto/query-rooms.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";
import { RoomsService } from "./rooms.service";

@ApiTags("rooms")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: "rooms",
  version: "1",
})
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  findAll(@Query() query: QueryRoomsDto) {
    return this.roomsService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get(":code")
  findOne(@Param("code") code: string) {
    return this.roomsService.findOne(code);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch(":code")
  update(@Param("code") code: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(code, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post(":code/meter-readings")
  createMeterReading(
    @Param("code") code: string,
    @Body() dto: CreateMeterReadingDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.roomsService.createMeterReading(code, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get(":code/meter-readings")
  findMeterReadings(@Param("code") code: string) {
    return this.roomsService.findMeterReadings(code);
  }
}
