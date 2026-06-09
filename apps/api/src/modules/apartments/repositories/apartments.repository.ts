import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../../shared/database/prisma.service";
import type { ApartmentWithRoomCount } from "../apartment-response";

@Injectable()
export class ApartmentsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.ApartmentCreateInput): Promise<ApartmentWithRoomCount> {
    return this.prismaService.apartment.create({
      data,
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });
  }

  updateByShortId(
    shortId: string,
    data: Prisma.ApartmentUpdateInput,
  ): Promise<ApartmentWithRoomCount> {
    return this.prismaService.apartment.update({
      where: { shortId },
      data,
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });
  }

  findByShortId(shortId: string): Promise<ApartmentWithRoomCount | null> {
    return this.prismaService.apartment.findUnique({
      where: { shortId },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });
  }

  async findManyPaginated(params: {
    where: Prisma.ApartmentWhereInput;
    skip: number;
    take: number;
  }): Promise<{
    items: ApartmentWithRoomCount[];
    total: number;
  }> {
    const { where, skip, take } = params;
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.apartment.findMany({
        where,
        skip,
        take,
        orderBy: [{ shortId: "asc" }, { createdAt: "asc" }],
        include: {
          _count: {
            select: { rooms: true },
          },
        },
      }),
      this.prismaService.apartment.count({ where }),
    ]);

    return { items, total };
  }

  async existsByShortId(shortId: string): Promise<boolean> {
    const apartment = await this.prismaService.apartment.findUnique({
      where: { shortId },
      select: { id: true },
    });

    return Boolean(apartment);
  }

  findExistingShortIds(): Promise<Array<{ shortId: string | null }>> {
    return this.prismaService.apartment.findMany({
      where: { shortId: { not: null } },
      select: { shortId: true },
    });
  }
}
