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
import { RevenueCommandService } from "./commands/revenue-command.service";
import { CreatePeriodReceivablesDto } from "./dto/create-period-receivables.dto";
import { CreateReceivablePaymentDto } from "./dto/create-receivable-payment.dto";
import { CreateReceivableDto } from "./dto/create-receivable.dto";
import { QueryReceivablesDto } from "./dto/query-receivables.dto";
import { QueryRevenueSummaryDto } from "./dto/query-revenue-summary.dto";
import { UpdateReceivableDto } from "./dto/update-receivable.dto";
import { RevenueQueryService } from "./queries/revenue-query.service";

@ApiTags("revenue")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: "revenue",
  version: "1",
})
export class RevenueController {
  constructor(
    private readonly revenueCommandService: RevenueCommandService,
    private readonly revenueQueryService: RevenueQueryService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post("receivables")
  createReceivable(
    @Body() dto: CreateReceivableDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueCommandService.createReceivable(dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post("receivables/generate-period")
  createPeriodReceivables(
    @Body() dto: CreatePeriodReceivablesDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueCommandService.createPeriodReceivables(dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get("receivables")
  findReceivables(@Query() query: QueryReceivablesDto) {
    return this.revenueQueryService.findReceivables(query);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get("summary")
  getSummary(@Query() query: QueryRevenueSummaryDto) {
    return this.revenueQueryService.getSummary(query);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get("receivables/:id")
  findReceivable(@Param("id") id: string) {
    return this.revenueQueryService.findReceivable(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch("receivables/:id")
  updateReceivable(
    @Param("id") id: string,
    @Body() dto: UpdateReceivableDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueCommandService.updateReceivable(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post("receivables/:id/payments")
  createPayment(
    @Param("id") id: string,
    @Body() dto: CreateReceivablePaymentDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueCommandService.createPayment(id, dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get("receivables/:id/payments")
  findPayments(@Param("id") id: string) {
    return this.revenueQueryService.findPayments(id);
  }
}
