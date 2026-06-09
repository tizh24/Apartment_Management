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
import {
  CommissionPaymentDto,
  CreateCommissionPaymentDto,
} from "./dto/commission-payment.dto";
import { CreateSaleProfileDto } from "./dto/create-sale-profile.dto";
import { QueryCommissionPaymentsDto } from "./dto/query-commission-payments.dto";
import { QuerySaleContractsDto } from "./dto/query-sale-contracts.dto";
import { QuerySaleProfilesDto } from "./dto/query-sale-profiles.dto";
import { UpdateSaleProfileDto } from "./dto/update-sale-profile.dto";
import { SalesCommandService } from "./commands/sales-command.service";
import { SalesQueryService } from "./queries/sales-query.service";

@ApiTags("sales")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: "sales",
  version: "1",
})
export class SalesController {
  constructor(
    private readonly salesCommandService: SalesCommandService,
    private readonly salesQueryService: SalesQueryService,
  ) {}

  @Roles(UserRole.SALE)
  @Get("me/summary")
  mySummary(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.salesQueryService.getMySummary(user);
  }

  @Roles(UserRole.ADMIN)
  @Post("profiles")
  createProfile(@Body() dto: CreateSaleProfileDto) {
    return this.salesCommandService.createProfile(dto);
  }

  @Roles(UserRole.ADMIN)
  @Get("profiles")
  findProfiles(@Query() query: QuerySaleProfilesDto) {
    return this.salesQueryService.findProfiles(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SALE)
  @Get("profiles/:id")
  findProfile(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.salesQueryService.findProfile(id, user);
  }

  @Roles(UserRole.ADMIN)
  @Patch("profiles/:id")
  updateProfile(@Param("id") id: string, @Body() dto: UpdateSaleProfileDto) {
    return this.salesCommandService.updateProfile(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SALE)
  @Get("contracts")
  findContracts(
    @Query() query: QuerySaleContractsDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.salesQueryService.findContracts(query, user);
  }

  @Roles(UserRole.ADMIN, UserRole.SALE)
  @Get("contracts/:id")
  findContract(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.salesQueryService.findContract(id, user);
  }

  @Roles(UserRole.ADMIN)
  @Post("commission-payments/preview")
  previewCommissionPayment(@Body() dto: CommissionPaymentDto) {
    return this.salesQueryService.getCommissionPreview(dto);
  }

  @Roles(UserRole.ADMIN)
  @Post("commission-payments")
  createCommissionPayment(
    @Body() dto: CreateCommissionPaymentDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.salesCommandService.createCommissionPayment(dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.SALE)
  @Get("commission-payments")
  findCommissionPayments(
    @Query() query: QueryCommissionPaymentsDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.salesQueryService.findCommissionPayments(query, user);
  }
}
