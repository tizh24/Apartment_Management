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

  findById(id: string) {
    return this.prismaService.revenueReceivable.findUnique({
      where: { id },
      include: this.receivableInclude,
    });
  }

  findPayments(receivableId: string) {
    return this.prismaService.revenuePayment.findMany({
      where: { receivableId },
      orderBy: { paidAt: "desc" },
      include: this.paymentInclude,
    });
  }

  findLeaseContractForReceivable(id: string) {
    return this.prismaService.leaseContract.findUnique({
      where: { id },
      include: {
        apartment: { select: { id: true, shortId: true, name: true } },
        room: { select: { id: true, code: true } },
        customer: { select: { id: true, fullName: true } },
      },
    });
  }

  findMeterReadingById(id: string) {
    return this.prismaService.meterReading.findUnique({ where: { id } });
  }

  findMeterReadingByRoomAndPeriod(
    roomId: string,
    periodStart: Date,
    periodEnd: Date,
  ) {
    return this.prismaService.meterReading.findUnique({
      where: {
        roomId_periodStart_periodEnd: {
          roomId,
          periodStart,
          periodEnd,
        },
      },
    });
  }

  findApartment(id: string) {
    return this.prismaService.apartment.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  findRoom(id: string) {
    return this.prismaService.room.findUnique({
      where: { id },
      select: { id: true, apartmentId: true },
    });
  }

  findCustomer(id: string) {
    return this.prismaService.customer.findUnique({
      where: { id },
      select: { id: true, apartmentId: true, currentRoomId: true },
    });
  }

  findLeaseContract(id: string) {
    return this.prismaService.leaseContract.findUnique({
      where: { id },
      select: {
        id: true,
        apartmentId: true,
        roomId: true,
        customerId: true,
      },
    });
  }

  aggregateSummary(where: Prisma.RevenueReceivableWhereInput) {
    return this.prismaService.revenueReceivable.aggregate({
      where,
      _sum: {
        amount: true,
        paidAmount: true,
        remainingAmount: true,
      },
      _count: true,
    });
  }

  groupByStatus(where: Prisma.RevenueReceivableWhereInput) {
    return this.prismaService.revenueReceivable.groupBy({
      by: ["status"],
      where,
      _sum: {
        amount: true,
        paidAmount: true,
        remainingAmount: true,
      },
      _count: true,
    });
  }

  groupByType(where: Prisma.RevenueReceivableWhereInput) {
    return this.prismaService.revenueReceivable.groupBy({
      by: ["type"],
      where,
      _sum: {
        amount: true,
        paidAmount: true,
        remainingAmount: true,
      },
      _count: true,
    });
  }

  private readonly receivableInclude = {
    apartment: { select: { id: true, shortId: true, name: true } },
    room: { select: { id: true, shortId: true, code: true } },
    customer: { select: { id: true, fullName: true, phoneNumber: true } },
    leaseContract: { select: { id: true, contractCode: true, status: true } },
    meterReading: { select: { id: true, periodStart: true, periodEnd: true, totalAmount: true } },
    _count: { select: { payments: true, changeLogs: true } },
  } satisfies Prisma.RevenueReceivableInclude;

  private readonly paymentInclude = {
    verifiedBy: { select: { id: true, username: true, fullName: true } },
  } satisfies Prisma.RevenuePaymentInclude;
}