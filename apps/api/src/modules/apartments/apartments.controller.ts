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

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ApartmentsCommandService } from "./commands/apartments-command.service";
import { CreateApartmentDto } from "./dto/create-apartment.dto";
import { QueryApartmentsDto } from "./dto/query-apartments.dto";
import { UpdateApartmentDto } from "./dto/update-apartment.dto";
import { ApartmentsQueryService } from "./queries/apartments-query.service";

@ApiTags("apartments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: "apartments",
  version: "1",
})
export class ApartmentsController {
  constructor(
    private readonly apartmentsCommandService: ApartmentsCommandService,
    private readonly apartmentsQueryService: ApartmentsQueryService,
  ) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateApartmentDto) {
    return this.apartmentsCommandService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  findAll(@Query() query: QueryApartmentsDto) {
    return this.apartmentsQueryService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get(":shortId")
  findOne(@Param("shortId") shortId: string) {
    return this.apartmentsQueryService.findOne(shortId);
  }

  @Roles(UserRole.ADMIN)
  @Patch(":shortId")
  update(@Param("shortId") shortId: string, @Body() dto: UpdateApartmentDto) {
    return this.apartmentsCommandService.update(shortId, dto);
  }
}
