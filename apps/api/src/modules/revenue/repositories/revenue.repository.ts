import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { PrismaService } from "../../../shared/database/prisma.service";

export type RevenueTransactionClient = Prisma.TransactionClient;

@Injectable()
export class RevenueRepository {
  constructor(private readonly prismaService: PrismaService) {}

  transaction<T>(callback: (transaction: RevenueTransactionClient) => Promise<T>) {
    return this.prismaService.$transaction(callback);
  }

  createReceivable(
    transaction: RevenueTransactionClient,
    data: Prisma.RevenueReceivableUncheckedCreateInput,
  ) {
    return transaction.revenueReceivable.create({
      data,
      include: this.receivableInclude,
    });
  }

  updateReceivable(
    transaction: RevenueTransactionClient,
    id: string,
    data: Prisma.RevenueReceivableUncheckedUpdateInput,
  ) {
    return transaction.revenueReceivable.update({
      where: { id },
      data,
      include: this.receivableInclude,
    });
  }

  createPayment(
    transaction: RevenueTransactionClient,
    data: Prisma.RevenuePaymentUncheckedCreateInput,
  ) {
    return transaction.revenuePayment.create({
      data,
      include: this.paymentInclude,
    });
  }

  createChangeLog(
    transaction: RevenueTransactionClient,
    data: Prisma.RevenueChangeLogUncheckedCreateInput,
  ) {
    return transaction.revenueChangeLog.create({ data });
  }

  countReceivables(transaction: RevenueTransactionClient) {
    return transaction.revenueReceivable.count();
  }

  findReceivableCode(transaction: RevenueTransactionClient, receivableCode: string) {
    return transaction.revenueReceivable.findUnique({
      where: { receivableCode },
      select: { id: true },
    });
  }

  async findManyPaginated(params: {
    where: Prisma.RevenueReceivableWhereInput;
    skip: number;
    take: number;
  }) {
    const { where, skip, take } = params;
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.revenueReceivable.findMany({
        where,
        skip,
        take,
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
        include: this.receivableInclude,
      }),
      this.prismaService.revenueReceivable.count({ where }),
    ]);

    return { items, total };
  }

  findReceivableById(id: string) {
    return this.prismaService.revenueReceivable.findUnique({ where: { id } });
  }

  findReceivableDetail(id: string) {
    return this.prismaService.revenueReceivable.findUnique({
      where: { id },
      include: {
        ...this.receivableInclude,
        payments: {
          orderBy: { paidAt: "desc" },
          include: {
            verifiedBy: { select: { id: true, username: true, fullName: true } },
          },
        },
        changeLogs: {
          orderBy: { createdAt: "desc" },
          include: {
            changedBy: { select: { id: true, username: true, fullName: true } },
          },
        },
      },
    });
  }

  findReceivablesForExport(where: Prisma.RevenueReceivableWhereInput) {
    return this.prismaService.revenueReceivable.findMany({
      where,
      orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
      include: this.receivableInclude,
    });
  }

  findPayments(where: Prisma.RevenuePaymentWhereInput) {
    return this.prismaService.revenuePayment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      include: this.paymentInclude,
    });
  }

  getSummary(where: Prisma.RevenueReceivableWhereInput) {
    return this.prismaService.$transaction([
      this.prismaService.revenueReceivable.aggregate({ where, _sum: { amount: true } }),
      this.prismaService.revenueReceivable.aggregate({ where, _sum: { paidAmount: true } }),
      this.prismaService.revenueReceivable.aggregate({ where, _sum: { remainingAmount: true } }),
      this.prismaService.revenueReceivable.groupBy({
        by: ["status"],
        where,
        orderBy: { status: "asc" },
        _count: { _all: true },
        _sum: { amount: true, paidAmount: true, remainingAmount: true },
      }),
      this.prismaService.revenueReceivable.groupBy({
        by: ["type"],
        where,
        orderBy: { type: "asc" },
        _count: { _all: true },
        _sum: { amount: true, paidAmount: true, remainingAmount: true },
      }),
    ]);
  }

  findContractForReceivables(leaseContractId: string) {
    return this.prismaService.leaseContract.findUnique({
      where: { id: leaseContractId },
      include: { room: true, customer: true, apartment: true },
    });
  }

  findContractReference(leaseContractId: string) {
    return this.prismaService.leaseContract.findUnique({
      where: { id: leaseContractId },
      select: { id: true, apartmentId: true, roomId: true, customerId: true },
    });
  }

  findMeterReadingById(id: string) {
    return this.prismaService.meterReading.findUnique({ where: { id } });
  }

  findMeterReadingReference(id: string) {
    return this.prismaService.meterReading.findUnique({
      where: { id },
      select: { id: true, roomId: true },
    });
  }

  findMeterReadingByRoomAndPeriod(params: {
    roomId: string;
    periodStart: Date;
    periodEnd: Date;
  }) {
    return this.prismaService.meterReading.findUnique({
      where: {
        roomId_periodStart_periodEnd: params,
      },
    });
  }

  private readonly receivableInclude = {
    apartment: { select: { id: true, shortId: true, name: true } },
    room: { select: { id: true, shortId: true, code: true, floor: true } },
    customer: { select: { id: true, fullName: true, phoneNumber: true } },
    leaseContract: { select: { id: true, contractCode: true, startDate: true, endDate: true } },
    meterReading: { select: { id: true, periodStart: true, periodEnd: true, totalAmount: true } },
    _count: { select: { payments: true, changeLogs: true } },
  } satisfies Prisma.RevenueReceivableInclude;

  private readonly paymentInclude = {
    receivable: {
      include: {
        customer: { select: { id: true, fullName: true, phoneNumber: true } },
        room: { select: { id: true, code: true } },
        leaseContract: { select: { id: true, contractCode: true } },
      },
    },
    verifiedBy: { select: { id: true, username: true, fullName: true } },
  } satisfies Prisma.RevenuePaymentInclude;
}
