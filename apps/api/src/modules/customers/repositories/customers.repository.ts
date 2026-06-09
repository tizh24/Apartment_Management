import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../../shared/database/prisma.service";

@Injectable()
export class CustomersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.CustomerUncheckedCreateInput) {
    return this.prismaService.customer.create({
      data,
      include: this.customerInclude,
    });
  }

  updateById(id: string, data: Prisma.CustomerUncheckedUpdateInput) {
    return this.prismaService.customer.update({
      where: { id },
      data,
      include: this.customerInclude,
    });
  }

  async findManyPaginated(params: {
    where: Prisma.CustomerWhereInput;
    skip: number;
    take: number;
  }) {
    const { where, skip, take } = params;
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.customer.findMany({
        where,
        skip,
        take,
        orderBy: [{ createdAt: "desc" }],
        include: this.customerInclude,
      }),
      this.prismaService.customer.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string) {
    return this.prismaService.customer.findUnique({
      where: { id },
    });
  }

  findByIdWithDocuments(id: string) {
    return this.prismaService.customer.findUnique({
      where: { id },
      include: {
        ...this.customerInclude,
        documents: {
          orderBy: { createdAt: "desc" },
        },
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

  findRoomApartment(roomId: string) {
    return this.prismaService.room.findUnique({
      where: { id: roomId },
      select: { apartmentId: true },
    });
  }

  createDocument(data: Prisma.CustomerDocumentUncheckedCreateInput) {
    return this.prismaService.customerDocument.create({ data });
  }

  findDocumentsByCustomerId(customerId: string) {
    return this.prismaService.customerDocument.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }

  findContractsByCustomerId(customerId: string) {
    return this.prismaService.leaseContract.findMany({
      where: { customerId },
      orderBy: [{ startDate: "desc" }],
      include: {
        apartment: {
          select: {
            id: true,
            shortId: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            shortId: true,
            code: true,
            floor: true,
            status: true,
          },
        },
        saleProfile: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
          },
        },
        _count: {
          select: {
            files: true,
            changeLogs: true,
          },
        },
      },
    });
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
}
