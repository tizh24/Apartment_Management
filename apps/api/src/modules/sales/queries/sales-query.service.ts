import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommissionStatus, Prisma, UserRole } from "@prisma/client";

import type { AuthenticatedRequestUser } from "../../auth/auth.types";
import type { CommissionPaymentDto } from "../dto/commission-payment.dto";
import type { QueryCommissionPaymentsDto } from "../dto/query-commission-payments.dto";
import type { QuerySaleContractsDto } from "../dto/query-sale-contracts.dto";
import type { QuerySaleProfilesDto } from "../dto/query-sale-profiles.dto";
import { SalesRepository } from "../repositories/sales.repository";

type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

@Injectable()
export class SalesQueryService {
  constructor(private readonly salesRepository: SalesRepository) {}

  async findProfiles(query: QuerySaleProfilesDto) {
    const { page, limit, skip } = this.getPagination(query.page, query.limit);
    const where: Prisma.SaleProfileWhereInput = {
      ...(typeof query.isActive === "boolean" ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search, mode: "insensitive" } },
              { phoneNumber: { contains: query.search, mode: "insensitive" } },
              { bankAccountNumber: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const { items, total } = await this.salesRepository.findProfilesPaginated({
      where,
      skip,
      take: limit,
    });

    return { items, meta: this.getMeta(page, limit, total) };
  }

  async findProfile(id: string, user?: AuthenticatedRequestUser) {
    const profile = await this.salesRepository.findProfileDetail(id);

    if (!profile) {
      throw new NotFoundException("Sale profile not found");
    }

    this.assertCanAccessSale(profile.userId, user);

    return {
      ...profile,
      summary: await this.getSaleSummary(profile.id),
    };
  }

  async findContracts(
    query: QuerySaleContractsDto,
    user?: AuthenticatedRequestUser,
  ) {
    const scopedSaleId = await this.getScopedSaleId(query.saleId, user);
    const { page, limit, skip } = this.getPagination(query.page, query.limit);
    const where: Prisma.SaleContractWhereInput = {
      ...(scopedSaleId ? { saleId: scopedSaleId } : {}),
      ...(query.contractStatus ? { contractStatus: query.contractStatus } : {}),
      ...(query.commissionStatus ? { commissionStatus: query.commissionStatus } : {}),
      ...(query.search
        ? {
            OR: [
              { contractCode: { contains: query.search, mode: "insensitive" } },
              { customerName: { contains: query.search, mode: "insensitive" } },
              { customerPhone: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.from || query.to
        ? {
            startDate: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const { items, total } = await this.salesRepository.findContractsPaginated({
      where,
      skip,
      take: limit,
    });

    return { items, meta: this.getMeta(page, limit, total) };
  }

  async findContract(id: string, user?: AuthenticatedRequestUser) {
    const contract = await this.salesRepository.findContractDetail(id);

    if (!contract) {
      throw new NotFoundException("Sale contract not found");
    }

    this.assertCanAccessSale(contract.sale.userId, user);

    return contract;
  }

  async getCommissionPreview(dto: CommissionPaymentDto) {
    const sale = await this.ensureSaleProfileExists(dto.saleId);
    const contracts = await this.getPayableContracts(dto.saleId, dto.contractIds);
    const totalAmount = contracts.reduce(
      (total, contract) => total + Number(contract.commissionAmount),
      0,
    );
    const paymentContent = this.buildPaymentContent(sale.fullName, contracts);

    return {
      sale,
      contracts,
      totalAmount,
      paymentContent,
      paymentQrUrl: this.buildPaymentQrUrl(sale, totalAmount, paymentContent),
    };
  }

  async findCommissionPayments(
    query: QueryCommissionPaymentsDto,
    user?: AuthenticatedRequestUser,
  ) {
    const scopedSaleId = await this.getScopedSaleId(query.saleId, user);
    const { page, limit, skip } = this.getPagination(query.page, query.limit);
    const where: Prisma.SaleCommissionPaymentWhereInput = {
      ...(scopedSaleId ? { saleId: scopedSaleId } : {}),
      ...(query.from || query.to
        ? {
            paidAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const { items, total } =
      await this.salesRepository.findCommissionPaymentsPaginated({
        where,
        skip,
        take: limit,
      });

    return { items, meta: this.getMeta(page, limit, total) };
  }

  async getMySummary(user: AuthenticatedRequestUser) {
    const sale = await this.getSaleProfileByUserId(user.id);

    return {
      sale,
      summary: await this.getSaleSummary(sale.id),
    };
  }

  private async ensureSaleProfileExists(id: string) {
    const sale = await this.salesRepository.findProfileById(id);

    if (!sale) {
      throw new NotFoundException("Sale profile not found");
    }

    return sale;
  }

  private async getSaleProfileByUserId(userId: string) {
    const sale = await this.salesRepository.findProfileByUserId(userId);

    if (!sale) {
      throw new NotFoundException("Sale profile not found for current user");
    }

    return sale;
  }

  private async getScopedSaleId(
    requestedSaleId?: string,
    user?: AuthenticatedRequestUser,
  ): Promise<string | undefined> {
    if (user?.role !== UserRole.SALE) {
      return requestedSaleId;
    }

    const sale = await this.getSaleProfileByUserId(user.id);

    if (requestedSaleId && requestedSaleId !== sale.id) {
      throw new ForbiddenException("Cannot access another sale profile");
    }

    return sale.id;
  }

  private assertCanAccessSale(
    saleUserId: string | null,
    user?: AuthenticatedRequestUser,
  ): void {
    if (user?.role === UserRole.SALE && saleUserId !== user.id) {
      throw new ForbiddenException("Cannot access another sale profile");
    }
  }

  private async getPayableContracts(saleId: string, contractIds: string[]) {
    const uniqueIds = [...new Set(contractIds)];

    if (uniqueIds.length !== contractIds.length) {
      throw new BadRequestException("Duplicate contract ids are not allowed");
    }

    const contracts = await this.salesRepository.findPayableContracts(
      saleId,
      uniqueIds,
    );

    if (contracts.length !== uniqueIds.length) {
      throw new BadRequestException("Some contracts do not belong to this sale");
    }

    const invalidContract = contracts.find(
      (contract) => contract.commissionStatus !== CommissionStatus.UNPAID,
    );

    if (invalidContract) {
      throw new BadRequestException(
        `Contract ${invalidContract.contractCode} is not payable`,
      );
    }

    return contracts;
  }

  private async getSaleSummary(saleId: string) {
    const [totalContracts, unpaidAggregate, paidAggregate] =
      await this.salesRepository.getSaleSummary(saleId);

    return {
      totalContracts,
      unpaidCommissionAmount: Number(unpaidAggregate._sum.commissionAmount ?? 0),
      paidCommissionAmount: Number(paidAggregate._sum.commissionAmount ?? 0),
    };
  }

  private buildPaymentContent(
    saleName: string,
    contracts: Array<{ contractCode: string }>,
  ): string {
    const contractCodes = contracts.map((contract) => contract.contractCode).join("-");

    return `PAY SALE ${saleName} ${contractCodes}`.slice(0, 140);
  }

  private buildPaymentQrUrl(
    sale: { bankCode: string | null; bankAccountNumber: string },
    amount: number,
    content: string,
  ): string | null {
    if (!sale.bankCode) {
      return null;
    }

    const encodedContent = encodeURIComponent(content);

    return `https://img.vietqr.io/image/${sale.bankCode}-${sale.bankAccountNumber}-compact2.png?amount=${amount}&addInfo=${encodedContent}`;
  }

  private getPagination(page = 1, limit = 20) {
    const normalizedPage = Math.max(page, 1);
    const normalizedLimit = Math.min(Math.max(limit, 1), 100);

    return {
      page: normalizedPage,
      limit: normalizedLimit,
      skip: (normalizedPage - 1) * normalizedLimit,
    };
  }

  private getMeta(page: number, limit: number, total: number): PageMeta {
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
