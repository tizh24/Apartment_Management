import {
  Body,
  Controller,
  Get,
  Header,
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
import { CreateReceivableDto } from "./dto/create-receivable.dto";
import { GeneratePeriodReceivablesDto } from "./dto/generate-period-receivables.dto";
import { QueryReceivablesDto } from "./dto/query-receivables.dto";
import { RecordPaymentDto } from "./dto/record-payment.dto";
import { RevenueSummaryDto } from "./dto/revenue-summary.dto";
import { UpdateReceivableDto } from "./dto/update-receivable.dto";
import { RevenueQueryService } from "./queries/revenue-query.service";

@ApiTags("revenue")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller({
  path: "revenue",
  version: "1",
})
export class RevenueController {
  constructor(
    private readonly revenueCommandService: RevenueCommandService,
    private readonly revenueQueryService: RevenueQueryService,
  ) {}

  @Post("receivables")
  createReceivable(
    @Body() dto: CreateReceivableDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueCommandService.createReceivable(dto, user);
  }

  @Post("receivables/generate-period")
  generatePeriodReceivables(
    @Body() dto: GeneratePeriodReceivablesDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueCommandService.generatePeriodReceivables(dto, user);
  }

  @Get("receivables")
  findReceivables(@Query() query: QueryReceivablesDto) {
    return this.revenueQueryService.findReceivables(query);
  }

  @Get("receivables/export.csv")
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", "attachment; filename=receivables-report.csv")
  exportCsv(@Query() query: QueryReceivablesDto) {
    return this.revenueQueryService.exportCsv(query);
  }

  @Get("receivables/export.xls")
  @Header("Content-Type", "application/vnd.ms-excel; charset=utf-8")
  @Header("Content-Disposition", "attachment; filename=receivables-report.xls")
  exportExcel(@Query() query: QueryReceivablesDto) {
    return this.revenueQueryService.exportCsv(query);
  }

  @Get("summary")
  getSummary(@Query() query: RevenueSummaryDto) {
    return this.revenueQueryService.getSummary(query);
  }

  @Get("payments")
  findPayments(@Query() query: RevenueSummaryDto) {
    return this.revenueQueryService.findPayments(query);
  }

  @Get("receivables/:id")
  findReceivable(@Param("id") id: string) {
    return this.revenueQueryService.findReceivable(id);
  }

  @Patch("receivables/:id")
  updateReceivable(
    @Param("id") id: string,
    @Body() dto: UpdateReceivableDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueCommandService.updateReceivable(id, dto, user);
  }

  @Post("receivables/:id/cancel")
  cancelReceivable(
    @Param("id") id: string,
    @Body("note") note: string | undefined,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueCommandService.cancelReceivable(id, user, note);
  }

  @Post("receivables/:id/payments")
  recordPayment(
    @Param("id") id: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueCommandService.recordPayment(id, dto, user);
  }
}
