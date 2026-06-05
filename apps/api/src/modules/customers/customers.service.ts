import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../shared/database/prisma.service";
import type { CreateCustomerDto } from "./dto/create-customer.dto";
import type { CreateCustomerDocumentDto } from "./dto/create-customer-document.dto";
import type { QueryCustomersDto } from "./dto/query-customers.dto";
import type { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class CustomersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    await this.ensureApartmentExists(dto.apartmentId);
    await this.assertRoomBelongsToApartment(dto.currentRoomId, dto.apartmentId);

    return this.prismaService.customer.create({
      data: {
        apartmentId: dto.apartmentId,
        currentRoomId: dto.currentRoomId,
        fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        nationality: dto.nationality,
        identityNumber: dto.identityNumber,
        passportNumber: dto.passportNumber,
        visaNumber: dto.visaNumber,
        status: dto.status,
        note: dto.note,
      },
      include: this.customerInclude,
    });
  }

  async findAll(query: QueryCustomersDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = this.buildCustomerWhere(query);

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
        include: this.customerInclude,
      }),
      this.prismaService.customer.count({ where }),
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

  async findOne(id: string) {
    const customer = await this.prismaService.customer.findUnique({
      where: { id },
      include: {
        ...this.customerInclude,
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.ensureCustomerExists(id);
    const nextApartmentId = dto.apartmentId ?? customer.apartmentId;

    if (dto.apartmentId) {
      await this.ensureApartmentExists(dto.apartmentId);
    }

    if (dto.currentRoomId) {
      await this.assertRoomBelongsToApartment(dto.currentRoomId, nextApartmentId);
    }

    return this.prismaService.customer.update({
      where: { id },
      data: {
        apartmentId: dto.apartmentId,
        currentRoomId: dto.currentRoomId,
        fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        nationality: dto.nationality,
        identityNumber: dto.identityNumber,
        passportNumber: dto.passportNumber,
        visaNumber: dto.visaNumber,
        status: dto.status,
        note: dto.note,
      },
      include: this.customerInclude,
    });
  }

  async createDocument(customerId: string, dto: CreateCustomerDocumentDto) {
    await this.ensureCustomerExists(customerId);

    return this.prismaService.customerDocument.create({
      data: {
        customerId,
        type: dto.type,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        mimeType: dto.mimeType,
        size: dto.size,
        note: dto.note,
      },
    });
  }

  async findDocuments(customerId: string) {
    await this.ensureCustomerExists(customerId);

    return this.prismaService.customerDocument.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findContracts(customerId: string) {
    await this.ensureCustomerExists(customerId);

    return {
      items: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  }

  async findReceivables(customerId: string) {
    await this.ensureCustomerExists(customerId);

    return {
      items: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  }

  private readonly customerInclude = {
    apartment: {
      select: {
        id: true,
        shortId: true,
        name: true,
      },
    },
    currentRoom: {
      select: {
        id: true,
        shortId: true,
        code: true,
        floor: true,
      },
    },
    _count: {
      select: {
        documents: true,
      },
    },
  } satisfies Prisma.CustomerInclude;

  private buildCustomerWhere(query: QueryCustomersDto): Prisma.CustomerWhereInput {
    const where: Prisma.CustomerWhereInput = {
      ...(query.apartmentId ? { apartmentId: query.apartmentId } : {}),
      ...(query.currentRoomId ? { currentRoomId: query.currentRoomId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.currentRoomCode
        ? { currentRoom: { code: query.currentRoomCode } }
        : {}),
    };

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: "insensitive" } },
        { phoneNumber: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { nationality: { contains: query.search, mode: "insensitive" } },
        { identityNumber: { contains: query.search, mode: "insensitive" } },
        { passportNumber: { contains: query.search, mode: "insensitive" } },
        { visaNumber: { contains: query.search, mode: "insensitive" } },
        { currentRoom: { code: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    return where;
  }

  private async ensureCustomerExists(id: string) {
    const customer = await this.prismaService.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    return customer;
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

  private async assertRoomBelongsToApartment(
    roomId: string | undefined,
    apartmentId: string,
  ): Promise<void> {
    if (!roomId) {
      return;
    }

    const room = await this.prismaService.room.findUnique({
      where: { id: roomId },
      select: { apartmentId: true },
    });

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    if (room.apartmentId !== apartmentId) {
      throw new BadRequestException("Room does not belong to apartment");
    }
  }
}
