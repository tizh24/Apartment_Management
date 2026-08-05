import { Injectable } from "@nestjs/common";
import { CustomerStatus, LeaseContractStatus, RoomStatus, type Prisma } from "@prisma/client";

import type { QueryDashboardDto } from "../dto/query-dashboard.dto";
import { DashboardRepository } from "../repositories/dashboard.repository";

@Injectable()
export class DashboardQueryService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getOverview(query: QueryDashboardDto) {
    const dateRange = this.buildDateRange(query.from, query.to);
    const apartmentFilter = query.apartmentId ? { apartmentId: query.apartmentId } : {};
    const roomFilter = query.apartmentId ? { apartmentId: query.apartmentId } : {};
    const receivableFilter: Prisma.RevenueReceivableWhereInput = {
      ...apartmentFilter,
      ...(dateRange ? { periodStart: dateRange } : {}),
    };

    const now = new Date();
    const nextSevenDays = new Date(now);
    nextSevenDays.setDate(now.getDate() + 7);

    const [
      totalRooms,
      occupiedRooms,
      vacantRooms,
      reservedRooms,
      maintenanceRooms,
      totalCustomers,
      rentingCustomers,
      activeContracts,
      expiringContracts,
      revenue,
    ] = await Promise.all([
      this.dashboardRepository.countRooms(roomFilter),
      this.dashboardRepository.countRooms({
        ...roomFilter,
        status: RoomStatus.OCCUPIED,
      }),
      this.dashboardRepository.countRooms({
        ...roomFilter,
        status: RoomStatus.VACANT,
      }),
      this.dashboardRepository.countRooms({
        ...roomFilter,
        status: RoomStatus.RESERVED,
      }),
      this.dashboardRepository.countRooms({
        ...roomFilter,
        status: RoomStatus.MAINTENANCE,
      }),
      this.dashboardRepository.countCustomers(apartmentFilter),
      this.dashboardRepository.countCustomers({
        ...apartmentFilter,
        status: CustomerStatus.RENTING,
      }),
      this.dashboardRepository.countContracts({
        ...apartmentFilter,
        status: { in: [LeaseContractStatus.ACTIVE, LeaseContractStatus.RESERVED] },
      }),
      this.dashboardRepository.findExpiringContracts({
        ...apartmentFilter,
        status: { in: [LeaseContractStatus.ACTIVE, LeaseContractStatus.RESERVED] },
        endDate: { gte: now, lte: nextSevenDays },
      }),
      this.dashboardRepository.aggregateReceivables(receivableFilter),
    ]);

    return {
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        vacant: vacantRooms,
        reserved: reservedRooms,
        maintenance: maintenanceRooms,
        occupancyRate: totalRooms > 0 ? occupiedRooms / totalRooms : 0,
      },
      customers: {
        total: totalCustomers,
        renting: rentingCustomers,
      },
      contracts: {
        active: activeContracts,
        expiringSoon: expiringContracts,
      },
      revenue: {
        receivableCount: revenue._count,
        totalAmount: Number(revenue._sum.amount ?? 0),
        paidAmount: Number(revenue._sum.paidAmount ?? 0),
        outstandingAmount: Number(revenue._sum.remainingAmount ?? 0),
      },
    };
  }

  private buildDateRange(
    from?: string,
    to?: string,
  ): Prisma.DateTimeFilter | undefined {
    if (!from && !to) {
      return undefined;
    }

    return {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }
}
