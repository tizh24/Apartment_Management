import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../../shared/database/prisma.service";

export type SalesTransactionClient = Prisma.TransactionClient;

@Injectable()
export class SalesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  transaction<T>(callback: (transaction: SalesTransactionClient) => Promise<T>) {
    return this.prismaService.$transaction(callback);
  }

  createProfile(data: Prisma.SaleProfileUncheckedCreateInput) {
    return this.prismaService.saleProfile.create({
      data,
      include: this.profileInclude,
    });
  }

  updateProfile(id: string, data: Prisma.SaleProfileUncheckedUpdateInput) {
    return this.prismaService.saleProfile.update({
      where: { id },
      data,
      include: this.profileInclude,
    });
  }

  async findProfilesPaginated(params: {
    where: Prisma.SaleProfileWhereInput;
    skip: number;
    take: number;
  }) {
    const { where, skip, take } = params;
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.saleProfile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: this.profileInclude,
      }),
      this.prismaService.saleProfile.count({ where }),
    ]);

    return { items, total };
  }

  findProfileById(id: string) {
    return this.prismaService.saleProfile.findUnique({ where: { id } });
  }

  findProfileByUserId(userId: string) {
    return this.prismaService.saleProfile.findUnique({ where: { userId } });
  }

  findProfileDetail(id: string) {
    return this.prismaService.saleProfile.findUnique({
      where: { id },
      include: {
        ...this.profileInclude,
        contracts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  findUserRole(userId: string) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
  }

  findContractDetail(id: string) {
    return this.prismaService.saleContract.findUnique({
      where: { id },
      include: this.contractInclude,
    });
  }

  async findContractsPaginated(params: {
    where: Prisma.SaleContractWhereInput;
    skip: number;
    take: number;
  }) {
    const { where, skip, take } = params;
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.saleContract.findMany({
        where,
        skip,
        take,
        orderBy: { startDate: "desc" },
        include: this.contractInclude,
      }),
      this.prismaService.saleContract.count({ where }),
    ]);

    return { items, total };
  }

  async findCommissionPaymentsPaginated(params: {
    where: Prisma.SaleCommissionPaymentWhereInput;
    skip: number;
    take: number;
  }) {
    const { where, skip, take } = params;
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.saleCommissionPayment.findMany({
        where,
        skip,
        take,
        orderBy: { paidAt: "desc" },
        include: this.paymentInclude,
      }),
      this.prismaService.saleCommissionPayment.count({ where }),
    ]);

    return { items, total };
  }

  createCommissionPayment(
    transaction: SalesTransactionClient,
    data: Prisma.SaleCommissionPaymentUncheckedCreateInput,
  ) {
    return transaction.saleCommissionPayment.create({
      data,
      include: this.paymentInclude,
    });
  }

  markContractsPaid(
    transaction: SalesTransactionClient,
    contractIds: string[],
    paidAt: Date,
  ) {
    return transaction.saleContract.updateMany({
      where: { id: { in: contractIds } },
      data: {
        commissionStatus: "PAID",
        commissionPaidAt: paidAt,
      },
    });
  }

  findPayableContracts(saleId: string, contractIds: string[]) {
    return this.prismaService.saleContract.findMany({
      where: {
        id: { in: contractIds },
        saleId,
      },
    });
  }

  getSaleSummary(saleId: string) {
    return this.prismaService.$transaction([
      this.prismaService.saleContract.count({ where: { saleId } }),
      this.prismaService.saleContract.aggregate({
        where: { saleId, commissionStatus: "UNPAID" },
        _sum: { commissionAmount: true },
      }),
      this.prismaService.saleContract.aggregate({
        where: { saleId, commissionStatus: "PAID" },
        _sum: { commissionAmount: true },
      }),
    ]);
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
}
