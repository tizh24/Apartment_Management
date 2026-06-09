import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { LeaseContractStatus, Prisma, UserRole } from "@prisma/client";

import type { AuthenticatedRequestUser } from "../../auth/auth.types";
import type { QueryContractsDto } from "../dto/query-contracts.dto";
import type { QueryExpiringContractsDto } from "../dto/query-expiring-contracts.dto";
import { ContractsRepository } from "../repositories/contracts.repository";

@Injectable()
export class ContractsQueryService {
  constructor(private readonly contractsRepository: ContractsRepository) {}

  async findAll(query: QueryContractsDto, user: AuthenticatedRequestUser) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = await this.buildContractWhere(query, user);
    const { items, total } = await this.contractsRepository.findManyPaginated({
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

  async findOne(id: string, user: AuthenticatedRequestUser) {
    const contract = await this.contractsRepository.findByIdWithDetails(id);

    if (!contract) {
      throw new NotFoundException("Lease contract not found");
    }

    this.assertCanReadContract(contract, user);

    return contract;
  }

  async findExpiring(query: QueryExpiringContractsDto, user: AuthenticatedRequestUser) {
    this.assertAllowedExpiringDays(query.days);

    const now = new Date();
    const until = new Date(now);
    until.setDate(until.getDate() + query.days);
    const saleProfileId = await this.getReadableSaleProfileId(user);

    return this.contractsRepository.findExpiring({
      status: { in: [LeaseContractStatus.ACTIVE, LeaseContractStatus.RESERVED] },
      endDate: { gte: now, lte: until },
      ...(query.apartmentId ? { apartmentId: query.apartmentId } : {}),
      ...(saleProfileId ? { saleProfileId } : {}),
    });
  }

  async findChangeLogs(id: string) {
    await this.ensureContractExists(id);

    return this.contractsRepository.findChangeLogs(id);
  }

  private async buildContractWhere(
    query: QueryContractsDto,
    user: AuthenticatedRequestUser,
  ): Promise<Prisma.LeaseContractWhereInput> {
    const saleProfileId = await this.getReadableSaleProfileId(user, query.saleProfileId);
    const where: Prisma.LeaseContractWhereInput = {
      ...(query.apartmentId ? { apartmentId: query.apartmentId } : {}),
      ...(query.roomId ? { roomId: query.roomId } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(saleProfileId ? { saleProfileId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            startDate: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    if (query.search) {
      where.OR = [
        { contractCode: { contains: query.search, mode: "insensitive" } },
        { customer: { fullName: { contains: query.search, mode: "insensitive" } } },
        { customer: { phoneNumber: { contains: query.search, mode: "insensitive" } } },
        { room: { code: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    return where;
  }

  private async getReadableSaleProfileId(
    user: AuthenticatedRequestUser,
    requestedSaleProfileId?: string,
  ): Promise<string | undefined> {
    if (user.role !== UserRole.SALE) {
      return requestedSaleProfileId;
    }

    const sale = await this.contractsRepository.findSaleProfileByUserId(user.id);

    if (!sale) {
      throw new ForbiddenException("Current user is not linked to a sale profile");
    }

    if (requestedSaleProfileId && requestedSaleProfileId !== sale.id) {
      throw new ForbiddenException("Cannot access another sale profile's contracts");
    }

    return sale.id;
  }

  private assertCanReadContract(
    contract: { saleProfile: { userId: string | null } | null },
    user: AuthenticatedRequestUser,
  ): void {
    if (user.role !== UserRole.SALE) {
      return;
    }

    if (contract.saleProfile?.userId !== user.id) {
      throw new ForbiddenException("Cannot access another sale profile's contract");
    }
  }

  private async ensureContractExists(id: string): Promise<void> {
    const contract = await this.contractsRepository.findById(id);

    if (!contract) {
      throw new NotFoundException("Lease contract not found");
    }
  }

  private assertAllowedExpiringDays(days: number): void {
    if (![3, 5, 7].includes(days)) {
      throw new BadRequestException("Expiring alert days must be 3, 5, or 7");
    }
  }
}
