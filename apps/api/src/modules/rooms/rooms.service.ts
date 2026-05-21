import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../shared/database/prisma.service";
import type { AuthenticatedRequestUser } from "../auth/auth.types";
import type { CreateMeterReadingDto } from "./dto/create-meter-reading.dto";
import type { CreateRoomDto } from "./dto/create-room.dto";
import type { QueryRoomsDto } from "./dto/query-rooms.dto";
import type { UpdateRoomDto } from "./dto/update-room.dto";

@Injectable()
export class RoomsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateRoomDto) {
    await this.ensureApartmentExists(dto.apartmentId);
    await this.ensureRoomCodeIsAvailable(dto.apartmentId, dto.code);
    const shortId = await this.generateNextRoomShortId();

    return this.prismaService.room.create({
      data: {
        shortId,
        apartmentId: dto.apartmentId,
        code: dto.code,
        floor: dto.floor,
        area: dto.area,
        monthlyRent: dto.monthlyRent,
        description: dto.description,
        amenities: dto.amenities ?? [],
        imageUrls: dto.imageUrls ?? [],
        status: dto.status,
        note: dto.note,
      },
      include: {
        apartment: true,
      },
    });
  }

  async findAll(query: QueryRoomsDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = this.buildRoomWhere(query);

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ code: "asc" }],
        include: {
          apartment: true,
        },
      }),
      this.prismaService.room.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(code: string) {
    const room = await this.prismaService.room.findFirst({
      where: { code },
      include: {
        apartment: true,
        meterReadings: {
          orderBy: { periodStart: "desc" },
          take: 5,
        },
      },
    });

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return {
      ...room,
      currentTenant: null,
      currentContract: null,
    };
  }

  async update(code: string, dto: UpdateRoomDto) {
    const room = await this.ensureRoomExistsByCode(code);

    if (dto.apartmentId) {
      await this.ensureApartmentExists(dto.apartmentId);
    }

    const nextApartmentId = dto.apartmentId ?? room.apartmentId;
    const nextCode = dto.code ?? room.code;

    if (nextApartmentId !== room.apartmentId || nextCode !== room.code) {
      await this.ensureRoomCodeIsAvailable(nextApartmentId, nextCode, room.id);
    }

    return this.prismaService.room.update({
      where: { id: room.id },
      data: {
        apartmentId: dto.apartmentId,
        code: dto.code,
        floor: dto.floor,
        area: dto.area,
        monthlyRent: dto.monthlyRent,
        description: dto.description,
        amenities: dto.amenities,
        imageUrls: dto.imageUrls,
        status: dto.status,
        note: dto.note,
      },
      include: {
        apartment: true,
      },
    });
  }

  async createMeterReading(
    roomCode: string,
    dto: CreateMeterReadingDto,
    user: AuthenticatedRequestUser,
  ) {
    const room = await this.ensureRoomExistsByCode(roomCode);

    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);

    if (periodEnd < periodStart) {
      throw new BadRequestException("Period end must be after period start");
    }

    if (dto.electricityEnd < dto.electricityStart) {
      throw new BadRequestException(
        "Electricity end index must be greater than or equal to start index",
      );
    }

    if (dto.waterEnd < dto.waterStart) {
      throw new BadRequestException(
        "Water end index must be greater than or equal to start index",
      );
    }

    const electricityUsage = dto.electricityEnd - dto.electricityStart;
    const waterUsage = dto.waterEnd - dto.waterStart;
    const totalAmount =
      electricityUsage * dto.electricityUnitPrice +
      waterUsage * dto.waterUnitPrice;

    try {
      return await this.prismaService.meterReading.create({
        data: {
          roomId: room.id,
          periodStart,
          periodEnd,
          electricityStart: dto.electricityStart,
          electricityEnd: dto.electricityEnd,
          electricityUsage,
          electricityUnitPrice: dto.electricityUnitPrice,
          waterStart: dto.waterStart,
          waterEnd: dto.waterEnd,
          waterUsage,
          waterUnitPrice: dto.waterUnitPrice,
          totalAmount,
          recordedById: user.id,
          note: dto.note,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Meter reading already exists for this period");
      }

      throw error;
    }
  }

  async findMeterReadings(roomCode: string) {
    const room = await this.ensureRoomExistsByCode(roomCode);

    return this.prismaService.meterReading.findMany({
      where: { roomId: room.id },
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

  private buildRoomWhere(query: QueryRoomsDto): Prisma.RoomWhereInput {
    const where: Prisma.RoomWhereInput = {};

    if (query.apartmentId) {
      where.apartmentId = query.apartmentId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: "insensitive" } },
        { floor: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    return where;
  }

  private async ensureApartmentExists(apartmentId: string): Promise<void> {
    const apartment = await this.prismaService.apartment.findUnique({
      where: { id: apartmentId },
      select: { id: true },
    });

    if (!apartment) {
      throw new NotFoundException("Apartment not found");
    }
  }

  private async ensureRoomExistsByCode(code: string) {
    const room = await this.prismaService.room.findFirst({
      where: { code },
    });

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return room;
  }

  private async ensureRoomCodeIsAvailable(
    apartmentId: string,
    code: string,
    excludingRoomId?: string,
  ): Promise<void> {
    const existingRoom = await this.prismaService.room.findUnique({
      where: {
        apartmentId_code: {
          apartmentId,
          code,
        },
      },
      select: { id: true },
    });

    if (existingRoom && existingRoom.id !== excludingRoomId) {
      throw new ConflictException("Room code already exists in this apartment");
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }

  private async generateNextRoomShortId(): Promise<string> {
    const rooms = await this.prismaService.room.findMany({
      where: { shortId: { not: null } },
      select: { shortId: true },
    });

    const maxNumber = rooms.reduce((max, room) => {
      const value = Number(room.shortId);

      return Number.isFinite(value) && value > max ? value : max;
    }, 0);

    return String(maxNumber + 1).padStart(3, "0");
  }
}
