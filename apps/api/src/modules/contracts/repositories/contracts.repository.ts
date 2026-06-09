import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { LeaseContractStatus } from "@prisma/client";

import { PrismaService } from "../../../shared/database/prisma.service";

export type ContractsTransactionClient = Prisma.TransactionClient;

@Injectable()
export class ContractsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  transaction<T>(callback: (transaction: ContractsTransactionClient) => Promise<T>) {
    return this.prismaService.$transaction(callback);
  }

  createContract(
    transaction: ContractsTransactionClient,
    data: Prisma.LeaseContractUncheckedCreateInput,
  ) {
    return transaction.leaseContract.create({
      data,
      include: this.contractInclude,
    });
  }

  updateContract(
    transaction: ContractsTransactionClient,
    id: string,
    data: Prisma.LeaseContractUncheckedUpdateInput,
  ) {
    return transaction.leaseContract.update({
      where: { id },
      data,
      include: this.contractInclude,
    });
  }

  createContractFile(
    transaction: ContractsTransactionClient,
    data: Prisma.LeaseContractFileUncheckedCreateInput,
  ) {
    return transaction.leaseContractFile.create({ data });
  }

  createChangeLog(
    transaction: ContractsTransactionClient,
    data: Prisma.LeaseContractChangeLogUncheckedCreateInput,
  ) {
    return transaction.leaseContractChangeLog.create({ data });
  }

  createCustomer(
    transaction: ContractsTransactionClient,
    data: Prisma.CustomerUncheckedCreateInput,
  ) {
    return transaction.customer.create({
      data,
      select: { id: true },
    });
  }

  countCustomers(transaction: ContractsTransactionClient) {
    return transaction.customer.count();
  }

  findCustomerId(transaction: ContractsTransactionClient, id: string) {
    return transaction.customer.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  updateRoomStatus(
    transaction: ContractsTransactionClient,
    roomId: string,
    status: Prisma.EnumRoomStatusFieldUpdateOperationsInput["set"],
  ) {
    return transaction.room.update({
      where: { id: roomId },
      data: { status },
    });
  }

  updateCustomerRenting(
    transaction: ContractsTransactionClient,
    customerId: string,
    roomId: string,
  ) {
    return transaction.customer.update({
      where: { id: customerId },
      data: {
        status: "RENTING",
        currentRoomId: roomId,
      },
    });
  }

  updateCustomerAfterInactiveContract(
    transaction: ContractsTransactionClient,
    customerId: string,
    roomId: string | null,
  ) {
    return transaction.customer.update({
      where: { id: customerId },
      data: {
        status: roomId ? "RENTING" : "ENDED",
        currentRoomId: roomId,
      },
    });
  }

  findOtherActiveContract(
    transaction: ContractsTransactionClient,
    customerId: string,
    excludingContractId: string,
  ) {
    return transaction.leaseContract.findFirst({
      where: {
        customerId,
        id: { not: excludingContractId },
        status: { in: [LeaseContractStatus.RESERVED, LeaseContractStatus.ACTIVE] },
      },
      select: { roomId: true },
      orderBy: { startDate: "desc" },
    });
  }

  findSaleContractByLeaseContractCode(leaseContractCode: string) {
    return this.prismaService.saleContract.findUnique({
      where: { contractCode: `SALE-${leaseContractCode}` },
      select: {
        id: true,
        commissionStatus: true,
      },
    });
  }

  async syncSaleContractFromLease(
    transaction: ContractsTransactionClient,
    previousLeaseContractCode: string,
    data: {
      contractCode: string;
      saleId: string;
      apartmentId: string;
      roomId: string;
      customerName: string;
      customerPhone: string;
      startDate: Date;
      endDate: Date;
      contractValue: Prisma.Decimal;
      commissionAmount: Prisma.Decimal;
      contractStatus: Prisma.EnumSaleContractStatusFieldUpdateOperationsInput["set"];
    },
  ) {
    const existing = await transaction.saleContract.findUnique({
      where: { contractCode: `SALE-${previousLeaseContractCode}` },
      select: { id: true, commissionStatus: true },
    });

    if (existing) {
      const commissionStatus =
        existing.commissionStatus === "PAID"
          ? existing.commissionStatus
          : data.contractStatus === "CANCELED"
            ? "CANCELED"
            : "UNPAID";

      return transaction.saleContract.update({
        where: { id: existing.id },
        data: {
          contractCode: `SALE-${data.contractCode}`,
          saleId: data.saleId,
          apartmentId: data.apartmentId,
          roomId: data.roomId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          startDate: data.startDate,
          endDate: data.endDate,
          contractValue: data.contractValue,
          commissionAmount: data.commissionAmount,
          contractStatus: data.contractStatus,
          commissionStatus,
        },
      });
    }

    const commissionStatus =
      data.contractStatus === "CANCELED" ? "CANCELED" : "UNPAID";

    const { contractCode, ...saleContractData } = data;

    return transaction.saleContract.create({
      data: {
        contractCode: `SALE-${contractCode}`,
        ...saleContractData,
        commissionStatus,
        note: "Generated from lease contract.",
      },
    });
  }

  async findManyPaginated(params: {
    where: Prisma.LeaseContractWhereInput;
    skip: number;
    take: number;
  }) {
    const { where, skip, take } = params;
    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.leaseContract.findMany({
        where,
        skip,
        take,
        orderBy: [{ startDate: "desc" }],
        include: this.contractInclude,
      }),
      this.prismaService.leaseContract.count({ where }),
    ]);

    return { items, total };
  }

  findById(id: string) {
    return this.prismaService.leaseContract.findUnique({ where: { id } });
  }

  findByIdWithDetails(id: string) {
    return this.prismaService.leaseContract.findUnique({
      where: { id },
      include: {
        ...this.contractInclude,
        files: { orderBy: { createdAt: "desc" } },
        changeLogs: {
          orderBy: { createdAt: "desc" },
          include: {
            changedBy: {
              select: {
                id: true,
                username: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
  }

  findExpiring(where: Prisma.LeaseContractWhereInput) {
    return this.prismaService.leaseContract.findMany({
      where,
      orderBy: { endDate: "asc" },
      include: this.contractInclude,
    });
  }

  findChangeLogs(leaseContractId: string) {
    return this.prismaService.leaseContractChangeLog.findMany({
      where: { leaseContractId },
      orderBy: { createdAt: "desc" },
      include: {
        changedBy: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
  }

  findRoomById(id: string) {
    return this.prismaService.room.findUnique({
      where: { id },
      select: { id: true, apartmentId: true },
    });
  }

  findCustomerById(id: string) {
    return this.prismaService.customer.findUnique({
      where: { id },
      select: { id: true, apartmentId: true },
    });
  }

  findSaleProfileById(id: string) {
    return this.prismaService.saleProfile.findUnique({
      where: { id },
      select: { id: true },
    });
  }

  findSaleProfileByUserId(userId: string) {
    return this.prismaService.saleProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
  }

  findRoomConflict(params: {
    roomId: string;
    startDate: Date;
    endDate: Date;
    excludingContractId?: string;
  }) {
    const { roomId, startDate, endDate, excludingContractId } = params;

    return this.prismaService.leaseContract.findFirst({
      where: {
        roomId,
        status: { in: [LeaseContractStatus.RESERVED, LeaseContractStatus.ACTIVE] },
        ...(excludingContractId ? { id: { not: excludingContractId } } : {}),
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
      select: { contractCode: true },
    });
  }

  countContracts() {
    return this.prismaService.leaseContract.count();
  }

  private readonly contractInclude = {
    apartment: { select: { id: true, shortId: true, name: true } },
    room: { select: { id: true, shortId: true, code: true, floor: true, status: true } },
    customer: { select: { id: true, fullName: true, phoneNumber: true, status: true } },
    saleProfile: { select: { id: true, userId: true, fullName: true, phoneNumber: true } },
    _count: { select: { files: true, changeLogs: true } },
  } satisfies Prisma.LeaseContractInclude;
}
