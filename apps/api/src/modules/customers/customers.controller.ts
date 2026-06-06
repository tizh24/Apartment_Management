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

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { CreateCustomerDocumentDto } from "./dto/create-customer-document.dto";
import { QueryCustomersDto } from "./dto/query-customers.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CustomersService } from "./customers.service";

@ApiTags("customers")
@ApiBearerAuth("bearer")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: "customers",
  version: "1",
})
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Create customer profile (ADMIN, STAFF)" })
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: "List customers with search, filters, and pagination (ADMIN, STAFF)",
  })
  @Get()
  findAll(@Query() query: QueryCustomersDto) {
    return this.customersService.findAll(query);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Get customer detail (ADMIN, STAFF)" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customersService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Update customer profile (ADMIN, STAFF)" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "Add customer document metadata (ADMIN, STAFF)" })
  @Post(":id/documents")
  createDocument(
    @Param("id") id: string,
    @Body() dto: CreateCustomerDocumentDto,
  ) {
    return this.customersService.createDocument(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: "List customer documents (ADMIN, STAFF)" })
  @Get(":id/documents")
  findDocuments(@Param("id") id: string) {
    return this.customersService.findDocuments(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: "List customer lease contract history (ADMIN, STAFF)",
  })
  @Get(":id/contracts")
  findContracts(@Param("id") id: string) {
    return this.customersService.findContracts(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({
    summary: "List customer receivables placeholder (ADMIN, STAFF)",
  })
  @Get(":id/receivables")
  findReceivables(@Param("id") id: string) {
    return this.customersService.findReceivables(id);
  }
}
