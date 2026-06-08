import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { AuthenticatedRequestUser } from "../../auth/auth.types";
import type { CreateMeterReadingDto } from "../dto/create-meter-reading.dto";
import type { CreateRoomDto } from "../dto/create-room.dto";
import type { UpdateRoomDto } from "../dto/update-room.dto";
import { RoomsRepository } from "../repositories/rooms.repository";

@Injectable()
export class RoomsCommandService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async create(dto: CreateRoomDto) {
    await this.ensureApartmentExists(dto.apartmentId);
    await this.ensureRoomCodeIsAvailable(dto.apartmentId, dto.code);
    const shortId = await this.generateNextRoomShortId();

    return this.roomsRepository.create({
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
    });
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

    return this.roomsRepository.updateById(room.id, {
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
      return await this.roomsRepository.createMeterReading({
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
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Meter reading already exists for this period");
      }

      throw error;
    }
  }

  private async ensureApartmentExists(apartmentId: string): Promise<void> {
    const exists = await this.roomsRepository.apartmentExists(apartmentId);

    if (!exists) {
      throw new NotFoundException("Apartment not found");
    }
  }

  private async ensureRoomExistsByCode(code: string) {
    const room = await this.roomsRepository.findByCode(code);

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
    const existingRoom = await this.roomsRepository.findByApartmentAndCode(
      apartmentId,
      code,
    );

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
    const rooms = await this.roomsRepository.findExistingShortIds();
    const maxNumber = rooms.reduce((max, room) => {
      const value = Number(room.shortId);

      return Number.isFinite(value) && value > max ? value : max;
    }, 0);

    return String(maxNumber + 1).padStart(3, "0");
  }
}
