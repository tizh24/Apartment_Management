import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { QueryCustomersDto } from "../dto/query-customers.dto";
import { CustomersRepository } from "../repositories/customers.repository";

@Injectable()
export class CustomersQueryService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async findAll(query: QueryCustomersDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = this.buildCustomerWhere(query);
    const { items, total } = await this.customersRepository.findManyPaginated({
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

  async findOne(id: string) {
    const customer = await this.customersRepository.findByIdWithDocuments(id);

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    return customer;
  }

  async findDocuments(customerId: string) {
    await this.ensureCustomerExists(customerId);

    return this.customersRepository.findDocumentsByCustomerId(customerId);
  }

  async findContracts(customerId: string) {
    await this.ensureCustomerExists(customerId);
    const items = await this.customersRepository.findContractsByCustomerId(customerId);

    return {
      items,
      meta: {
        page: 1,
        limit: items.length,
        total: items.length,
        totalPages: items.length > 0 ? 1 : 0,
      },
    };
  }

  async findReceivables(customerId: string) {
    await this.ensureCustomerExists(customerId);
    const items = await this.customersRepository.findReceivablesByCustomerId(customerId);

    return {
      items,
      meta: {
        page: 1,
        limit: items.length,
        total: items.length,
        totalPages: items.length > 0 ? 1 : 0,
      },
    };
  }

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

  private async ensureCustomerExists(id: string): Promise<void> {
    const customer = await this.customersRepository.findById(id);

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
  }
}
