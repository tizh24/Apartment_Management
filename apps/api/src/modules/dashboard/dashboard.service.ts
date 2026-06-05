import { Injectable } from '@nestjs/common';
import { Prisma, RoomStatus } from '@prisma/client';
import { PrismaService } from "../../shared/database/prisma.service";
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(query: DashboardQueryDto): Promise<DashboardSummaryDto> {
    const roomWhere: Prisma.RoomWhereInput = {};

    if (query.apartmentId) {
      roomWhere.apartmentId = query.apartmentId;
    }

    const meterReadingWhere: Prisma.MeterReadingWhereInput = {};

    if (query.from || query.to) {
      meterReadingWhere.periodStart = {};

      if (query.from) {
        meterReadingWhere.periodStart.gte = new Date(query.from);
      }

      if (query.to) {
        meterReadingWhere.periodStart.lte = new Date(query.to);
      }
    }

    if (query.apartmentId) {
      meterReadingWhere.room = {
        apartmentId: query.apartmentId,
      };
    }

    const [
      totalApartments,
      totalRooms,
      occupiedRooms,
      vacantRooms,
      reservedRooms,
      checkoutSoonRooms,
      maintenanceRooms,
      meterReadingTotal,
    ] = await Promise.all([
      this.prisma.apartment.count(),

      this.prisma.room.count({
        where: roomWhere,
      }),

      this.prisma.room.count({
        where: {
          ...roomWhere,
          status: RoomStatus.OCCUPIED,
        },
      }),

      this.prisma.room.count({
        where: {
          ...roomWhere,
          status: RoomStatus.VACANT,
        },
      }),

      this.prisma.room.count({
        where: {
          ...roomWhere,
          status: RoomStatus.RESERVED,
        },
      }),

      this.prisma.room.count({
        where: {
          ...roomWhere,
          status: RoomStatus.CHECKOUT_SOON,
        },
      }),

      this.prisma.room.count({
        where: {
          ...roomWhere,
          status: RoomStatus.MAINTENANCE,
        },
      }),

      this.prisma.meterReading.aggregate({
        where: meterReadingWhere,
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    const occupancyRate =
      totalRooms === 0 ? 0 : Number(((occupiedRooms / totalRooms) * 100).toFixed(2));

    return {
      totalApartments,
      totalRooms,
      occupiedRooms,
      vacantRooms,
      reservedRooms,
      checkoutSoonRooms,
      maintenanceRooms,
      occupancyRate,
      totalMeterReadingAmount: Number(meterReadingTotal._sum.totalAmount ?? 0),
    };
  }
}