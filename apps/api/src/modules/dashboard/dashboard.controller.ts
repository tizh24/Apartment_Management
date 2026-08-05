import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { QueryDashboardDto } from "./dto/query-dashboard.dto";
import { DashboardQueryService } from "./queries/dashboard-query.service";

@ApiTags("dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: "dashboard",
  version: "1",
})
export class DashboardController {
  constructor(private readonly dashboardQueryService: DashboardQueryService) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get("overview")
  getOverview(@Query() query: QueryDashboardDto) {
    return this.dashboardQueryService.getOverview(query);
  }
}
