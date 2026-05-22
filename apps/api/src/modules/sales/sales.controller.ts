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
import { CreateSaleContractDto } from "./dto/create-sale-contract.dto";
import { CreateSaleProfileDto } from "./dto/create-sale-profile.dto";
import { QueryCommissionPaymentsDto } from "./dto/query-commission-payments.dto";
import { QuerySaleContractsDto } from "./dto/query-sale-contracts.dto";
import { QuerySaleProfilesDto } from "./dto/query-sale-profiles.dto";
import { UpdateSaleContractDto } from "./dto/update-sale-contract.dto";
import { UpdateSaleProfileDto } from "./dto/update-sale-profile.dto";
import { SalesService } from "./sales.service";

@ApiTags("sales")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: "sales",
  version: "1",
})
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Roles(UserRole.SALE)
  @Get("me/summary")
  mySummary(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.salesService.getMySummary(user);
  }

  @Roles(UserRole.ADMIN)
  @Post("profiles")
  createProfile(@Body() dto: CreateSaleProfileDto) {
    return this.salesService.createProfile(dto);
  }

  @Roles(UserRole.ADMIN)
  @Get("profiles")
  findProfiles(@Query() query: QuerySaleProfilesDto) {
    return this.salesService.findProfiles(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SALE)
  @Get("profiles/:id")
  findProfile(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.salesService.findProfile(id, user);
  }

  @Roles(UserRole.ADMIN)
  @Patch("profiles/:id")
  updateProfile(@Param("id") id: string, @Body() dto: UpdateSaleProfileDto) {
    return this.salesService.updateProfile(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Post("contracts")
  createContract(@Body() dto: CreateSaleContractDto) {
    return this.salesService.createContract(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SALE)
  @Get("contracts")
  findContracts(
    @Query() query: QuerySaleContractsDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.salesService.findContracts(query, user);
  }

  @Roles(UserRole.ADMIN, UserRole.SALE)
  @Get("contracts/:id")
  findContract(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.salesService.findContract(id, user);
  }

  @Roles(UserRole.ADMIN)
  @Patch("contracts/:id")
  updateContract(@Param("id") id: string, @Body() dto: UpdateSaleContractDto) {
    return this.salesService.updateContract(id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Post("commission-payments/preview")
  previewCommissionPayment(@Body() dto: CommissionPaymentDto) {
    return this.salesService.getCommissionPreview(dto);
  }

  @Roles(UserRole.ADMIN)
  @Post("commission-payments")
  createCommissionPayment(
    @Body() dto: CreateCommissionPaymentDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.salesService.createCommissionPayment(dto, user);
  }

  @Roles(UserRole.ADMIN, UserRole.SALE)
  @Get("commission-payments")
  findCommissionPayments(
    @Query() query: QueryCommissionPaymentsDto,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.salesService.findCommissionPayments(query, user);
  }
}
