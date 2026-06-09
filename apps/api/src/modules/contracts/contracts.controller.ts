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
import { ContractsCommandService } from "./commands/contracts-command.service";
import {
  CancelContractDto,
  EndContractEarlyDto,
  ExtendContractDto,
} from "./dto/contract-action.dto";
import { CreateContractDto } from "./dto/create-contract.dto";
import { CreateContractFileDto } from "./dto/create-contract-file.dto";
import { QueryContractsDto } from "./dto/query-contracts.dto";
import { QueryExpiringContractsDto } from "./dto/query-expiring-contracts.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { ContractsQueryService } from "./queries/contracts-query.service";

@ApiTags("contracts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: "contracts",
  version: "1",
})
export class ContractsController {
  constructor(
    private readonly contractsCommandService: ContractsCommandService,
    private readonly contractsQueryService: ContractsQueryService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post()
  create(
    @Body() dto: CreateContractDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsCommandService.create(dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.SALE)
  @Get()
  findAll(
    @Query() query: QueryContractsDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsQueryService.findAll(query, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.SALE)
  @Get("expiring")
  findExpiring(
    @Query() query: QueryExpiringContractsDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsQueryService.findExpiring(query, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.SALE)
  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsQueryService.findOne(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateContractDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsCommandService.update(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post(":id/extend")
  extend(
    @Param("id") id: string,
    @Body() dto: ExtendContractDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsCommandService.extend(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post(":id/end-early")
  endEarly(
    @Param("id") id: string,
    @Body() dto: EndContractEarlyDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsCommandService.endEarly(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post(":id/cancel")
  cancel(
    @Param("id") id: string,
    @Body() dto: CancelContractDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsCommandService.cancel(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post(":id/files")
  createFile(
    @Param("id") id: string,
    @Body() dto: CreateContractFileDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsCommandService.createFile(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get(":id/change-logs")
  findChangeLogs(@Param("id") id: string) {
    return this.contractsQueryService.findChangeLogs(id);
  }
}
