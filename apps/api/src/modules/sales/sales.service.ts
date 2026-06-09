import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommissionStatus, Prisma, UserRole } from "@prisma/client";

import type { AuthenticatedRequestUser } from "../auth/auth.types";
import { PrismaService } from "../../shared/database/prisma.service";
import type { CommissionPaymentDto, CreateCommissionPaymentDto } from "./dto/commission-payment.dto";
import type { CreateSaleContractDto } from "./dto/create-sale-contract.dto";
import type { CreateSaleProfileDto } from "./dto/create-sale-profile.dto";
import type { QueryCommissionPaymentsDto } from "./dto/query-commission-payments.dto";
import type { QuerySaleContractsDto } from "./dto/query-sale-contracts.dto";
import type { QuerySaleProfilesDto } from "./dto/query-sale-profiles.dto";
import type { UpdateSaleContractDto } from "./dto/update-sale-contract.dto";
import type { UpdateSaleProfileDto } from "./dto/update-sale-profile.dto";

type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

@Injectable()
export class SalesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProfile(dto: CreateSaleProfileDto) {
    if (dto.userId) {
      await this.assertSaleUser(dto.userId);
    }

    return this.prismaService.saleProfile.create({
      data: dto,
      include: this.profileInclude,
    });
  }

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

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.saleProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: this.profileInclude,
      }),
      this.prismaService.saleProfile.count({ where }),
    ]);

    return { items, meta: this.getMeta(page, limit, total) };
  }

  async findProfile(id: string, user?: AuthenticatedRequestUser) {
    const profile = await this.prismaService.saleProfile.findUnique({
      where: { id },
      include: {
        ...this.profileInclude,
        contracts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException("Sale profile not found");
    }

    this.assertCanAccessSale(profile.userId, user);

    return {
      ...profile,
      summary: await this.getSaleSummary(profile.id),
    };
  }

  async updateProfile(id: string, dto: UpdateSaleProfileDto) {
    await this.ensureSaleProfileExists(id);

    if (dto.userId) {
      await this.assertSaleUser(dto.userId);
    }

    return this.prismaService.saleProfile.update({
      where: { id },
      data: dto,
      include: this.profileInclude,
    });
  }

  async createContract(dto: CreateSaleContractDto) {
    await this.ensureSaleProfileExists(dto.saleId);
    await this.assertRoomBelongsToApartment(dto.roomId, dto.apartmentId);

    return this.prismaService.saleContract.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: this.contractInclude,
    });
  }

  async findContracts(query: QuerySaleContractsDto, user?: AuthenticatedRequestUser) {
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

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.saleContract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: "desc" },
        include: this.contractInclude,
      }),
      this.prismaService.saleContract.count({ where }),
    ]);

    return { items, meta: this.getMeta(page, limit, total) };
  }

  async findContract(id: string, user?: AuthenticatedRequestUser) {
    const contract = await this.prismaService.saleContract.findUnique({
      where: { id },
      include: this.contractInclude,
    });

    if (!contract) {
      throw new NotFoundException("Sale contract not found");
    }

    this.assertCanAccessSale(contract.sale.userId, user);

    return contract;
  }

  async updateContract(id: string, dto: UpdateSaleContractDto) {
    const contract = await this.prismaService.saleContract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException("Sale contract not found");
    }

    if (contract.commissionStatus === CommissionStatus.PAID) {
      throw new BadRequestException("Paid commission contracts cannot be edited");
    }

    if (dto.saleId) {
      await this.ensureSaleProfileExists(dto.saleId);
    }

    await this.assertRoomBelongsToApartment(dto.roomId, dto.apartmentId);

    return this.prismaService.saleContract.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: this.contractInclude,
    });
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

  async createCommissionPayment(
    dto: CreateCommissionPaymentDto,
    confirmedBy: AuthenticatedRequestUser,
  ) {
    const preview = await this.getCommissionPreview(dto);
    const paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();

    return this.prismaService.$transaction(async (transaction) => {
      const payment = await transaction.saleCommissionPayment.create({
        data: {
          saleId: dto.saleId,
          totalAmount: preview.totalAmount,
          paymentContent: preview.paymentContent,
          paymentQrUrl: preview.paymentQrUrl,
          confirmedById: confirmedBy.id,
          paidAt,
          note: dto.note,
          items: {
            create: preview.contracts.map((contract) => ({
              saleContractId: contract.id,
              amount: contract.commissionAmount,
            })),
          },
        },
        include: this.paymentInclude,
      });

      await transaction.saleContract.updateMany({
        where: { id: { in: dto.contractIds } },
        data: {
          commissionStatus: CommissionStatus.PAID,
          commissionPaidAt: paidAt,
        },
      });

      return payment;
    });
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

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.saleCommissionPayment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paidAt: "desc" },
        include: this.paymentInclude,
      }),
      this.prismaService.saleCommissionPayment.count({ where }),
    ]);

    return { items, meta: this.getMeta(page, limit, total) };
  }

  async getMySummary(user: AuthenticatedRequestUser) {
    const sale = await this.getSaleProfileByUserId(user.id);

    return {
      sale,
      summary: await this.getSaleSummary(sale.id),
    };
  }

  private readonly profileInclude = {
    user: {
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
      },
    },
    _count: {
      select: {
        contracts: true,
        commissionPayments: true,
      },
    },
  } satisfies Prisma.SaleProfileInclude;

  private readonly contractInclude = {
    sale: true,
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
        code: true,
      },
    },
  } satisfies Prisma.SaleContractInclude;

  private readonly paymentInclude = {
    sale: true,
    confirmedBy: {
      select: {
        id: true,
        username: true,
        fullName: true,
      },
    },
    items: {
      include: {
        saleContract: true,
      },
    },
  } satisfies Prisma.SaleCommissionPaymentInclude;

  private async assertSaleUser(userId: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role !== UserRole.SALE) {
      throw new BadRequestException("Sale profile can only be linked to SALE users");
    }
  }

  private async ensureSaleProfileExists(id: string) {
    const sale = await this.prismaService.saleProfile.findUnique({
      where: { id },
    });

    if (!sale) {
      throw new NotFoundException("Sale profile not found");
    }

    return sale;
  }

  private async getSaleProfileByUserId(userId: string) {
    const sale = await this.prismaService.saleProfile.findUnique({
      where: { userId },
    });

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

  private async assertRoomBelongsToApartment(
    roomId?: string,
    apartmentId?: string,
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

    if (apartmentId && room.apartmentId !== apartmentId) {
      throw new BadRequestException("Room does not belong to apartment");
    }
  }

  private async getPayableContracts(saleId: string, contractIds: string[]) {
    const uniqueIds = [...new Set(contractIds)];

    if (uniqueIds.length !== contractIds.length) {
      throw new BadRequestException("Duplicate contract ids are not allowed");
    }

    const contracts = await this.prismaService.saleContract.findMany({
      where: {
        id: { in: uniqueIds },
        saleId,
      },
    });

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
      await this.prismaService.$transaction([
        this.prismaService.saleContract.count({ where: { saleId } }),
        this.prismaService.saleContract.aggregate({
          where: { saleId, commissionStatus: CommissionStatus.UNPAID },
          _sum: { commissionAmount: true },
        }),
        this.prismaService.saleContract.aggregate({
          where: { saleId, commissionStatus: CommissionStatus.PAID },
          _sum: { commissionAmount: true },
        }),
      ]);

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
