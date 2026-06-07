import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  LeaseContractStatus,
  Prisma,
  RevenueChangeAction,
  RevenuePaymentMethod,
  RevenueReceivableStatus,
  RevenueReceivableType,
} from "@prisma/client";

import { PrismaService } from "../../shared/database/prisma.service";
import type { AuthenticatedRequestUser } from "../auth/auth.types";
import type { CreateReceivableDto } from "./dto/create-receivable.dto";
import type { GeneratePeriodReceivablesDto } from "./dto/generate-period-receivables.dto";
import type { QueryReceivablesDto } from "./dto/query-receivables.dto";
import type { RecordPaymentDto } from "./dto/record-payment.dto";
import type { RevenueSummaryDto } from "./dto/revenue-summary.dto";
import type { UpdateReceivableDto } from "./dto/update-receivable.dto";

type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class RevenueService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReceivable(dto: CreateReceivableDto, user: AuthenticatedRequestUser) {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    const dueDate = new Date(dto.dueDate);
    this.assertValidPeriod(periodStart, periodEnd, dueDate);

    await this.assertReceivableReferences(dto);

    return this.prismaService.$transaction(async (transaction) => {
      const receivable = await transaction.revenueReceivable.create({
        data: {
          receivableCode: await this.generateNextReceivableCode(transaction),
          apartmentId: dto.apartmentId,
          roomId: dto.roomId,
          customerId: dto.customerId,
          leaseContractId: dto.leaseContractId,
          meterReadingId: dto.meterReadingId,
          type: dto.type,
          description: dto.description,
          periodStart,
          periodEnd,
          dueDate,
          amount: dto.amount,
          paidAmount: 0,
          remainingAmount: dto.amount,
          status: dto.amount > 0 ? RevenueReceivableStatus.UNPAID : RevenueReceivableStatus.PAID,
          note: dto.note,
        },
        include: this.receivableInclude,
      });

      await this.createChangeLog(transaction, receivable.id, user.id, RevenueChangeAction.CREATED, null, receivable, dto.note);

      return receivable;
    });
  }

  async generatePeriodReceivables(dto: GeneratePeriodReceivablesDto, user: AuthenticatedRequestUser) {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    const dueDate = new Date(dto.dueDate);
    this.assertValidPeriod(periodStart, periodEnd, dueDate);

    const contract = await this.prismaService.leaseContract.findUnique({
      where: { id: dto.leaseContractId },
      include: { room: true, customer: true, apartment: true },
    });

    if (!contract) {
      throw new NotFoundException("Lease contract not found");
    }

    if (contract.status === LeaseContractStatus.CANCELED || contract.status === LeaseContractStatus.ENDED) {
      throw new BadRequestException("Cannot generate receivables for inactive contract");
    }

    const meterReading = dto.meterReadingId
      ? await this.prismaService.meterReading.findUnique({ where: { id: dto.meterReadingId } })
      : await this.prismaService.meterReading.findUnique({
          where: {
            roomId_periodStart_periodEnd: {
              roomId: contract.roomId,
              periodStart,
              periodEnd,
            },
          },
        });

    if (dto.includeUtilities !== false && meterReading && meterReading.roomId !== contract.roomId) {
      throw new BadRequestException("Meter reading does not belong to contract room");
    }

    const items: Array<{
      type: RevenueReceivableType;
      description: string;
      amount: Prisma.Decimal | number;
      meterReadingId?: string;
    }> = [];

    if (dto.includeRent !== false) {
      items.push({
        type: RevenueReceivableType.RENT,
        description: `Room rent ${contract.room.code} ${this.formatPeriodLabel(periodStart, periodEnd)}`,
        amount: contract.monthlyRent,
      });
    }

    if (dto.includeUtilities !== false && meterReading) {
      items.push({
        type: RevenueReceivableType.ELECTRICITY,
        description: `Electricity ${contract.room.code} ${this.formatPeriodLabel(periodStart, periodEnd)}`,
        amount: meterReading.electricityUsage.mul(meterReading.electricityUnitPrice),
        meterReadingId: meterReading.id,
      });
      items.push({
        type: RevenueReceivableType.WATER,
        description: `Water ${contract.room.code} ${this.formatPeriodLabel(periodStart, periodEnd)}`,
        amount: meterReading.waterUsage.mul(meterReading.waterUnitPrice),
        meterReadingId: meterReading.id,
      });
    }

    if (dto.serviceAmount && dto.serviceAmount > 0) {
      items.push({
        type: RevenueReceivableType.SERVICE,
        description: `Service fee ${contract.room.code} ${this.formatPeriodLabel(periodStart, periodEnd)}`,
        amount: dto.serviceAmount,
      });
    }

    if (dto.otherAmount && dto.otherAmount > 0) {
      items.push({
        type: RevenueReceivableType.OTHER,
        description: `Other fee ${contract.room.code} ${this.formatPeriodLabel(periodStart, periodEnd)}`,
        amount: dto.otherAmount,
      });
    }

    if (items.length === 0) {
      throw new BadRequestException("No receivable items to generate");
    }

    return this.prismaService.$transaction(async (transaction) => {
      const created = [];

      for (const item of items) {
        const amount = new Prisma.Decimal(item.amount);
        const receivable = await transaction.revenueReceivable.create({
          data: {
            receivableCode: await this.generateNextReceivableCode(transaction),
            apartmentId: contract.apartmentId,
            roomId: contract.roomId,
            customerId: contract.customerId,
            leaseContractId: contract.id,
            meterReadingId: item.meterReadingId,
            type: item.type,
            description: item.description,
            periodStart,
            periodEnd,
            dueDate,
            amount,
            paidAmount: 0,
            remainingAmount: amount,
            status: RevenueReceivableStatus.UNPAID,
            note: dto.note,
          },
          include: this.receivableInclude,
        });

        await this.createChangeLog(transaction, receivable.id, user.id, RevenueChangeAction.CREATED, null, receivable, dto.note);
        created.push(receivable);
      }

      return { items: created, total: created.length };
    });
  }

  async findReceivables(query: QueryReceivablesDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = this.buildReceivableWhere(query);

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.revenueReceivable.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
        include: this.receivableInclude,
      }),
      this.prismaService.revenueReceivable.count({ where }),
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

  async findReceivable(id: string) {
    const receivable = await this.prismaService.revenueReceivable.findUnique({
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

    if (!receivable) {
      throw new NotFoundException("Receivable not found");
    }

    return receivable;
  }

  async updateReceivable(id: string, dto: UpdateReceivableDto, user: AuthenticatedRequestUser) {
    const existing = await this.ensureReceivableExists(id);

    if (existing.status === RevenueReceivableStatus.CANCELED) {
      throw new BadRequestException("Canceled receivables cannot be edited");
    }

    const periodStart = dto.periodStart ? new Date(dto.periodStart) : existing.periodStart;
    const periodEnd = dto.periodEnd ? new Date(dto.periodEnd) : existing.periodEnd;
    const dueDate = dto.dueDate ? new Date(dto.dueDate) : existing.dueDate;
    this.assertValidPeriod(periodStart, periodEnd, dueDate);

    const nextAmount = dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : existing.amount;
    if (nextAmount.lessThan(existing.paidAmount)) {
      throw new BadRequestException("Amount cannot be smaller than paid amount");
    }

    const nextRemaining = nextAmount.minus(existing.paidAmount);
    const nextStatus = this.calculateStatus(nextAmount, existing.paidAmount, existing.status);

    if (dto.apartmentId || dto.roomId || dto.customerId || dto.leaseContractId || dto.meterReadingId) {
      await this.assertReceivableReferences({
        apartmentId: dto.apartmentId ?? existing.apartmentId,
        roomId: dto.roomId ?? existing.roomId,
        customerId: dto.customerId ?? existing.customerId,
        leaseContractId: dto.leaseContractId ?? existing.leaseContractId,
        meterReadingId: dto.meterReadingId ?? existing.meterReadingId ?? undefined,
      });
    }

    return this.prismaService.$transaction(async (transaction) => {
      const updated = await transaction.revenueReceivable.update({
        where: { id },
        data: {
          apartmentId: dto.apartmentId,
          roomId: dto.roomId,
          customerId: dto.customerId,
          leaseContractId: dto.leaseContractId,
          meterReadingId: dto.meterReadingId,
          type: dto.type,
          description: dto.description,
          periodStart: dto.periodStart ? periodStart : undefined,
          periodEnd: dto.periodEnd ? periodEnd : undefined,
          dueDate: dto.dueDate ? dueDate : undefined,
          amount: dto.amount !== undefined ? nextAmount : undefined,
          remainingAmount: nextRemaining,
          status: nextStatus,
          note: dto.note,
        },
        include: this.receivableInclude,
      });

      await this.createChangeLog(transaction, id, user.id, RevenueChangeAction.UPDATED, existing, updated, dto.note);

      return updated;
    });
  }

  async cancelReceivable(id: string, user: AuthenticatedRequestUser, note?: string) {
    const existing = await this.ensureReceivableExists(id);

    if (existing.paidAmount.greaterThan(0)) {
      throw new BadRequestException("Receivables with payments cannot be canceled");
    }

    return this.prismaService.$transaction(async (transaction) => {
      const updated = await transaction.revenueReceivable.update({
        where: { id },
        data: { status: RevenueReceivableStatus.CANCELED, remainingAmount: 0 },
        include: this.receivableInclude,
      });

      await this.createChangeLog(transaction, id, user.id, RevenueChangeAction.CANCELED, existing, updated, note);

      return updated;
    });
  }

  async recordPayment(id: string, dto: RecordPaymentDto, user: AuthenticatedRequestUser) {
    const receivable = await this.ensureReceivableExists(id);

    if (receivable.status === RevenueReceivableStatus.CANCELED) {
      throw new BadRequestException("Cannot pay a canceled receivable");
    }

    const amount = new Prisma.Decimal(dto.amount);
    if (amount.lessThanOrEqualTo(0)) {
      throw new BadRequestException("Payment amount must be greater than zero");
    }

    if (amount.greaterThan(receivable.remainingAmount)) {
      throw new BadRequestException("Payment amount exceeds remaining amount");
    }

    return this.prismaService.$transaction(async (transaction) => {
      const payment = await transaction.revenuePayment.create({
        data: {
          receivableId: id,
          amount,
          method: dto.method ?? RevenuePaymentMethod.BANK_TRANSFER,
          paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
          transactionCode: dto.transactionCode,
          evidenceUrl: dto.evidenceUrl,
          evidenceNote: dto.evidenceNote,
          verifiedById: user.id,
          note: dto.note,
        },
        include: this.paymentInclude,
      });

      const paidAmount = receivable.paidAmount.plus(amount);
      const remainingAmount = receivable.amount.minus(paidAmount);
      const status = this.calculateStatus(receivable.amount, paidAmount);
      const updated = await transaction.revenueReceivable.update({
        where: { id },
        data: { paidAmount, remainingAmount, status },
        include: this.receivableInclude,
      });

      await this.createChangeLog(transaction, id, user.id, RevenueChangeAction.PAYMENT_RECORDED, receivable, { receivable: updated, payment }, dto.note);

      return { receivable: updated, payment };
    });
  }

  async findPayments(query: RevenueSummaryDto) {
    const where: Prisma.RevenuePaymentWhereInput = {
      ...(query.from || query.to
        ? {
            paidAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
      ...(query.apartmentId ? { receivable: { apartmentId: query.apartmentId } } : {}),
    };

    return this.prismaService.revenuePayment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      include: this.paymentInclude,
    });
  }

  async getSummary(query: RevenueSummaryDto) {
    const where = this.buildSummaryWhere(query);
    const [receivableTotal, paidTotal, remainingTotal, byStatus, byType] = await this.prismaService.$transaction([
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

    return {
      totalReceivable: receivableTotal._sum.amount ?? new Prisma.Decimal(0),
      totalPaid: paidTotal._sum.paidAmount ?? new Prisma.Decimal(0),
      totalOutstanding: remainingTotal._sum.remainingAmount ?? new Prisma.Decimal(0),
      byStatus,
      byType,
    };
  }

  async exportCsv(query: QueryReceivablesDto): Promise<string> {
    const where = this.buildReceivableWhere({ ...query, page: 1, limit: 100 });
    const items = await this.prismaService.revenueReceivable.findMany({
      where,
      orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
      include: this.receivableInclude,
    });

    const header = [
      "Code",
      "Type",
      "Status",
      "Customer",
      "Room",
      "Contract",
      "PeriodStart",
      "PeriodEnd",
      "DueDate",
      "Amount",
      "PaidAmount",
      "RemainingAmount",
    ];
    const rows = items.map((item) => [
      item.receivableCode,
      item.type,
      item.status,
      item.customer.fullName,
      item.room.code,
      item.leaseContract.contractCode,
      item.periodStart.toISOString().slice(0, 10),
      item.periodEnd.toISOString().slice(0, 10),
      item.dueDate.toISOString().slice(0, 10),
      item.amount.toString(),
      item.paidAmount.toString(),
      item.remainingAmount.toString(),
    ]);

    return [header, ...rows].map((row) => row.map((cell) => this.escapeCsv(cell)).join(",")).join("\n");
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

  private buildReceivableWhere(query: QueryReceivablesDto): Prisma.RevenueReceivableWhereInput {
    const where: Prisma.RevenueReceivableWhereInput = {
      ...(query.apartmentId ? { apartmentId: query.apartmentId } : {}),
      ...(query.roomId ? { roomId: query.roomId } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.leaseContractId ? { leaseContractId: query.leaseContractId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            dueDate: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    if (query.search) {
      where.OR = [
        { receivableCode: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { customer: { fullName: { contains: query.search, mode: "insensitive" } } },
        { customer: { phoneNumber: { contains: query.search, mode: "insensitive" } } },
        { room: { code: { contains: query.search, mode: "insensitive" } } },
        { leaseContract: { contractCode: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    return where;
  }

  private buildSummaryWhere(query: RevenueSummaryDto): Prisma.RevenueReceivableWhereInput {
    return {
      status: { not: RevenueReceivableStatus.CANCELED },
      ...(query.apartmentId ? { apartmentId: query.apartmentId } : {}),
      ...(query.from || query.to
        ? {
            dueDate: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };
  }

  private async assertReceivableReferences(dto: {
    apartmentId: string;
    roomId: string;
    customerId: string;
    leaseContractId: string;
    meterReadingId?: string;
  }): Promise<void> {
    const [contract, meterReading] = await Promise.all([
      this.prismaService.leaseContract.findUnique({
        where: { id: dto.leaseContractId },
        select: { id: true, apartmentId: true, roomId: true, customerId: true },
      }),
      dto.meterReadingId
        ? this.prismaService.meterReading.findUnique({
            where: { id: dto.meterReadingId },
            select: { id: true, roomId: true },
          })
        : null,
    ]);

    if (!contract) {
      throw new NotFoundException("Lease contract not found");
    }

    if (contract.apartmentId !== dto.apartmentId) {
      throw new BadRequestException("Receivable apartment does not match contract");
    }

    if (contract.roomId !== dto.roomId) {
      throw new BadRequestException("Receivable room does not match contract");
    }

    if (contract.customerId !== dto.customerId) {
      throw new BadRequestException("Receivable customer does not match contract");
    }

    if (dto.meterReadingId && !meterReading) {
      throw new NotFoundException("Meter reading not found");
    }

    if (meterReading && meterReading.roomId !== dto.roomId) {
      throw new BadRequestException("Meter reading does not belong to room");
    }
  }

  private assertValidPeriod(periodStart: Date, periodEnd: Date, dueDate: Date): void {
    if ([periodStart, periodEnd, dueDate].some((date) => Number.isNaN(date.getTime()))) {
      throw new BadRequestException("Invalid period or due date");
    }

    if (periodEnd < periodStart) {
      throw new BadRequestException("Period end must be after or equal to period start");
    }
  }

  private calculateStatus(
    amount: Prisma.Decimal,
    paidAmount: Prisma.Decimal,
    requestedStatus?: RevenueReceivableStatus,
  ): RevenueReceivableStatus {
    if (requestedStatus === RevenueReceivableStatus.CANCELED) {
      return RevenueReceivableStatus.CANCELED;
    }

    if (paidAmount.equals(0)) {
      return RevenueReceivableStatus.UNPAID;
    }

    if (paidAmount.greaterThanOrEqualTo(amount)) {
      return RevenueReceivableStatus.PAID;
    }

    return RevenueReceivableStatus.PARTIALLY_PAID;
  }

  private async ensureReceivableExists(id: string) {
    const receivable = await this.prismaService.revenueReceivable.findUnique({ where: { id } });

    if (!receivable) {
      throw new NotFoundException("Receivable not found");
    }

    return receivable;
  }

  private async createChangeLog(
    transaction: TransactionClient,
    receivableId: string,
    changedById: string | null,
    action: RevenueChangeAction,
    beforeData: unknown,
    afterData: unknown,
    note?: string,
  ): Promise<void> {
    await transaction.revenueChangeLog.create({
      data: {
        receivableId,
        changedById,
        action,
        beforeData: this.toInputJsonValue(beforeData),
        afterData: this.toInputJsonValue(afterData),
        note,
      },
    });
  }

  private toInputJsonValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (value === null || typeof value === "undefined") {
      return Prisma.JsonNull;
    }

    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private async generateNextReceivableCode(transaction: TransactionClient): Promise<string> {
    const count = await transaction.revenueReceivable.count();

    for (let index = count + 1; index < count + 1000; index += 1) {
      const code = `REV-${String(index).padStart(6, "0")}`;
      const existing = await transaction.revenueReceivable.findUnique({
        where: { receivableCode: code },
        select: { id: true },
      });

      if (!existing) {
        return code;
      }
    }

    throw new BadRequestException("Cannot generate receivable code");
  }

  private formatPeriodLabel(periodStart: Date, periodEnd: Date): string {
    return `${periodStart.toISOString().slice(0, 10)} to ${periodEnd.toISOString().slice(0, 10)}`;
  }

  private escapeCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }
}
