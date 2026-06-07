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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

import type { AuthenticatedRequestUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateReceivableDto } from "./dto/create-receivable.dto";
import { GeneratePeriodReceivablesDto } from "./dto/generate-period-receivables.dto";
import { QueryReceivablesDto } from "./dto/query-receivables.dto";
import { RecordPaymentDto } from "./dto/record-payment.dto";
import { RevenueSummaryDto } from "./dto/revenue-summary.dto";
import { UpdateReceivableDto } from "./dto/update-receivable.dto";
import { RevenueService } from "./revenue.service";

@ApiTags("revenue")
@ApiBearerAuth("bearer")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller({
  path: "revenue",
  version: "1",
})
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @ApiOperation({ summary: "Create a receivable manually (ADMIN, STAFF)" })
  @Post("receivables")
  createReceivable(
    @Body() dto: CreateReceivableDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueService.createReceivable(dto, user);
  }

  @ApiOperation({ summary: "Generate period receivables from a lease contract and meter reading (ADMIN, STAFF)" })
  @Post("receivables/generate-period")
  generatePeriodReceivables(
    @Body() dto: GeneratePeriodReceivablesDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueService.generatePeriodReceivables(dto, user);
  }

  @ApiOperation({ summary: "List receivables with filters and pagination (ADMIN, STAFF)" })
  @Get("receivables")
  findReceivables(@Query() query: QueryReceivablesDto) {
    return this.revenueService.findReceivables(query);
  }

  @ApiOperation({ summary: "Export receivables report as CSV (ADMIN, STAFF)" })
  @Get("receivables/export.csv")
  @Header("Content-Type", "text/csv; charset=utf-8")
  @Header("Content-Disposition", "attachment; filename=receivables-report.csv")
  exportCsv(@Query() query: QueryReceivablesDto) {
    return this.revenueService.exportCsv(query);
  }

  @ApiOperation({ summary: "Export receivables report as Excel-compatible file (ADMIN, STAFF)" })
  @Get("receivables/export.xls")
  @Header("Content-Type", "application/vnd.ms-excel; charset=utf-8")
  @Header("Content-Disposition", "attachment; filename=receivables-report.xls")
  exportExcel(@Query() query: QueryReceivablesDto) {
    return this.revenueService.exportCsv(query);
  }

  @ApiOperation({ summary: "Get revenue summary (ADMIN, STAFF)" })
  @Get("summary")
  getSummary(@Query() query: RevenueSummaryDto) {
    return this.revenueService.getSummary(query);
  }

  @ApiOperation({ summary: "List verified payments (ADMIN, STAFF)" })
  @Get("payments")
  findPayments(@Query() query: RevenueSummaryDto) {
    return this.revenueService.findPayments(query);
  }

  @ApiOperation({ summary: "Get receivable detail with payments and audit logs (ADMIN, STAFF)" })
  @Get("receivables/:id")
  findReceivable(@Param("id") id: string) {
    return this.revenueService.findReceivable(id);
  }

  @ApiOperation({ summary: "Update a receivable (ADMIN, STAFF)" })
  @Patch("receivables/:id")
  updateReceivable(
    @Param("id") id: string,
    @Body() dto: UpdateReceivableDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueService.updateReceivable(id, dto, user);
  }

  @ApiOperation({ summary: "Cancel an unpaid receivable (ADMIN, STAFF)" })
  @Post("receivables/:id/cancel")
  cancelReceivable(
    @Param("id") id: string,
    @Body("note") note: string | undefined,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueService.cancelReceivable(id, user, note);
  }

  @ApiOperation({ summary: "Record a payment for a receivable (ADMIN, STAFF)" })
  @Post("receivables/:id/payments")
  recordPayment(
    @Param("id") id: string,
    @Body() dto: RecordPaymentDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.revenueService.recordPayment(id, dto, user);
  }
}
