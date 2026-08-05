import { Injectable } from "@nestjs/common";
import { LeaseContractStatus, RoomStatus, type Prisma } from "@prisma/client";

import { PrismaService } from "../../../shared/database/prisma.service";

@Injectable()
export class DashboardRepository {
  constructor(private readonly prismaService: PrismaService) {}

  countRooms(where: Prisma.RoomWhereInput) {
    return this.prismaService.room.count({ where });
  }

  countCustomers(where: Prisma.CustomerWhereInput) {
    return this.prismaService.customer.count({ where });
  }

  countContracts(where: Prisma.LeaseContractWhereInput) {
    return this.prismaService.leaseContract.count({ where });
  }

  aggregateReceivables(where: Prisma.RevenueReceivableWhereInput) {
    return this.prismaService.revenueReceivable.aggregate({
      where,
      _sum: {
        amount: true,
        paidAmount: true,
        remainingAmount: true,
      },
      _count: true,
    });
  }

  findExpiringContracts(where: Prisma.LeaseContractWhereInput) {
    return this.prismaService.leaseContract.findMany({
      where,
      orderBy: { endDate: "asc" },
      take: 10,
      include: {
        apartment: { select: { id: true, shortId: true, name: true } },
        room: { select: { id: true, shortId: true, code: true } },
        customer: { select: { id: true, fullName: true, phoneNumber: true } },
      },
    });
  }

  get roomStatus() {
    return RoomStatus;
  }

  get leaseContractStatus() {
    return LeaseContractStatus;
  }
}
