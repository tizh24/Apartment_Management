import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags ,ApiOperation} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
@Controller({
  path: 'dashboard',
  version: '1',
})

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
@Controller({
  path: 'dashboard',
  version: '1',
})
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary' })
  getSummary(
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardSummaryDto> {
    return this.dashboardService.getSummary(query);
  }
}
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(UserRole.ADMIN, UserRole.STAFF)