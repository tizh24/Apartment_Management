import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../shared/database/prisma.service";
import type { CreateApartmentDto } from "./dto/create-apartment.dto";
import type { QueryApartmentsDto } from "./dto/query-apartments.dto";
import type { UpdateApartmentDto } from "./dto/update-apartment.dto";

@Injectable()
export class ApartmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateApartmentDto) {
    const shortId = await this.generateNextApartmentShortId();

    const apartment = await this.prismaService.apartment.create({
      data: {
        shortId,
        name: dto.name,
        address: dto.address,
        timezone: dto.timezone,
        note: dto.note,
      },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });

    return this.toApartmentResponse(apartment);
  }

  async findAll(query: QueryApartmentsDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = this.buildApartmentWhere(query);

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.apartment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ shortId: "asc" }, { createdAt: "asc" }],
        include: {
          _count: {
            select: { rooms: true },
          },
        },
      }),
      this.prismaService.apartment.count({ where }),
    ]);

    return {
      items: items.map((apartment) => this.toApartmentResponse(apartment)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(shortId: string) {
    const apartment = await this.prismaService.apartment.findUnique({
      where: { shortId },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });

    if (!apartment) {
      throw new NotFoundException("Apartment not found");
    }

    return this.toApartmentResponse(apartment);
  }

  async update(shortId: string, dto: UpdateApartmentDto) {
    await this.ensureApartmentExistsByShortId(shortId);

    const apartment = await this.prismaService.apartment.update({
      where: { shortId },
      data: {
        name: dto.name,
        address: dto.address,
        timezone: dto.timezone,
        note: dto.note,
      },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });

    return this.toApartmentResponse(apartment);
  }

  private buildApartmentWhere(
    query: QueryApartmentsDto,
  ): Prisma.ApartmentWhereInput {
    if (!query.search) {
      return {};
    }

    return {
      OR: [
        { shortId: { contains: query.search, mode: "insensitive" } },
        { name: { contains: query.search, mode: "insensitive" } },
        { address: { contains: query.search, mode: "insensitive" } },
      ],
    };
  }

  private async ensureApartmentExistsByShortId(shortId: string): Promise<void> {
    const apartment = await this.prismaService.apartment.findUnique({
      where: { shortId },
      select: { id: true },
    });

    if (!apartment) {
      throw new NotFoundException("Apartment not found");
    }
  }

  private async generateNextApartmentShortId(): Promise<string> {
    const apartments = await this.prismaService.apartment.findMany({
      where: { shortId: { not: null } },
      select: { shortId: true },
    });

    const maxNumber = apartments.reduce((max, apartment) => {
      const value = Number(apartment.shortId);

      return Number.isFinite(value) && value > max ? value : max;
    }, 0);

    return String(maxNumber + 1).padStart(2, "0");
  }

  private toApartmentResponse<T extends { _count: { rooms: number } }>(
    apartment: T,
  ): Omit<T, "_count"> & { roomCount: number } {
    const { _count, ...data } = apartment;

    return {
      ...data,
      roomCount: _count.rooms,
    };
  }
}
