import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { QueryRoomsDto } from "../dto/query-rooms.dto";
import { RoomsRepository } from "../repositories/rooms.repository";

@Injectable()
export class RoomsQueryService {
  constructor(private readonly roomsRepository: RoomsRepository) {}

  async findAll(query: QueryRoomsDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = this.buildRoomWhere(query);
    const { items, total } = await this.roomsRepository.findManyPaginated({
      where,
      skip,
      take: limit,
    });

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
    const room = await this.roomsRepository.findByCodeWithDetails(code);

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return {
      ...room,
      currentTenant: null,
      currentContract: null,
    };
  }

  async findMeterReadings(roomCode: string) {
    const room = await this.roomsRepository.findByCode(roomCode);

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return this.roomsRepository.findMeterReadingsByRoomId(room.id);
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
}
