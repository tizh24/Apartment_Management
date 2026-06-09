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
import { CustomersCommandService } from "./commands/customers-command.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { CreateCustomerDocumentDto } from "./dto/create-customer-document.dto";
import { QueryCustomersDto } from "./dto/query-customers.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CustomersQueryService } from "./queries/customers-query.service";

@ApiTags("customers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: "customers",
  version: "1",
})
export class CustomersController {
  constructor(
    private readonly customersCommandService: CustomersCommandService,
    private readonly customersQueryService: CustomersQueryService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersCommandService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  findAll(@Query() query: QueryCustomersDto) {
    return this.customersQueryService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customersQueryService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersCommandService.update(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post(":id/documents")
  createDocument(
    @Param("id") id: string,
    @Body() dto: CreateCustomerDocumentDto,
  ) {
    return this.customersCommandService.createDocument(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get(":id/documents")
  findDocuments(@Param("id") id: string) {
    return this.customersQueryService.findDocuments(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get(":id/contracts")
  findContracts(@Param("id") id: string) {
    return this.customersQueryService.findContracts(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get(":id/receivables")
  findReceivables(@Param("id") id: string) {
    return this.customersQueryService.findReceivables(id);
  }
}
