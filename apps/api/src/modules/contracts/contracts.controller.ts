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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

import type { AuthenticatedRequestUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
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
import { ContractsService } from "./contracts.service";

@ApiTags("contracts")
@ApiBearerAuth("bearer")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: "contracts",
  version: "1",
})
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Create lease contract (ADMIN, STAFF)" })
  @Post()
  create(
    @Body() dto: CreateContractDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsService.create(dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.SALE)
  @ApiOperation({ summary: "List lease contracts (ADMIN, STAFF, SALE)" })
  @Get()
  findAll(
    @Query() query: QueryContractsDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsService.findAll(query, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.SALE)
  @ApiOperation({ summary: "List contracts expiring soon (ADMIN, STAFF, SALE)" })
  @Get("expiring")
  findExpiring(
    @Query() query: QueryExpiringContractsDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsService.findExpiring(query, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.SALE)
  @ApiOperation({ summary: "Get lease contract detail (ADMIN, STAFF, SALE)" })
  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsService.findOne(id, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Update lease contract (ADMIN, STAFF)" })
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateContractDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsService.update(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Extend lease contract (ADMIN, STAFF)" })
  @Post(":id/extend")
  extend(
    @Param("id") id: string,
    @Body() dto: ExtendContractDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsService.extend(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "End lease contract early (ADMIN, STAFF)" })
  @Post(":id/end-early")
  endEarly(
    @Param("id") id: string,
    @Body() dto: EndContractEarlyDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsService.endEarly(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Cancel lease contract (ADMIN, STAFF)" })
  @Post(":id/cancel")
  cancel(
    @Param("id") id: string,
    @Body() dto: CancelContractDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsService.cancel(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Add lease contract file metadata (ADMIN, STAFF)" })
  @Post(":id/files")
  createFile(
    @Param("id") id: string,
    @Body() dto: CreateContractFileDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.contractsService.createFile(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "List lease contract audit logs (ADMIN, STAFF)" })
  @Get(":id/change-logs")
  findChangeLogs(@Param("id") id: string) {
    return this.contractsService.findChangeLogs(id);
  }
}
