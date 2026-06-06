import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../../shared/database/prisma.service";

@Injectable()
export class RoomsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.RoomUncheckedCreateInput) {
    return this.prismaService.room.create({
      data,
      include: {
        apartment: true,
      },
    });
  }

  async findManyPaginated(params: {
    where: Prisma.RoomWhereInput;
    skip: number;
    take: number;
  }) {
    const { where, skip, take } = params;
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.room.findMany({
        where,
        skip,
        take,
        orderBy: [{ code: "asc" }],
        include: {
          apartment: true,
        },
      }),
      this.prismaService.room.count({ where }),
    ]);

    return { items, total };
  }

  findByCode(code: string) {
    return this.prismaService.room.findFirst({
      where: { code },
    });
  }

  findByCodeWithDetails(code: string) {
    return this.prismaService.room.findFirst({
      where: { code },
      include: {
        apartment: true,
        meterReadings: {
          orderBy: { periodStart: "desc" },
          take: 5,
        },
      },
    });
  }

  updateById(id: string, data: Prisma.RoomUncheckedUpdateInput) {
    return this.prismaService.room.update({
      where: { id },
      data,
      include: {
        apartment: true,
      },
    });
  }

  async apartmentExists(apartmentId: string): Promise<boolean> {
    const apartment = await this.prismaService.apartment.findUnique({
      where: { id: apartmentId },
      select: { id: true },
    });

    return Boolean(apartment);
  }

  findByApartmentAndCode(apartmentId: string, code: string) {
    return this.prismaService.room.findUnique({
      where: {
        apartmentId_code: {
          apartmentId,
          code,
        },
      },
      select: { id: true },
    });
  }

  findExistingShortIds(): Promise<Array<{ shortId: string | null }>> {
    return this.prismaService.room.findMany({
      where: { shortId: { not: null } },
      select: { shortId: true },
    });
  }

  createMeterReading(data: Prisma.MeterReadingUncheckedCreateInput) {
    return this.prismaService.meterReading.create({
      data,
    });
  }

  findMeterReadingsByRoomId(roomId: string) {
    return this.prismaService.meterReading.findMany({
      where: { roomId },
      orderBy: { periodStart: "desc" },
      include: {
        recordedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }
}
