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

import type { AuthenticatedRequestUser } from "../../auth/auth.types";
import type { CreateReceivableDto } from "../dto/create-receivable.dto";
import type { GeneratePeriodReceivablesDto } from "../dto/generate-period-receivables.dto";
import type { RecordPaymentDto } from "../dto/record-payment.dto";
import type { UpdateReceivableDto } from "../dto/update-receivable.dto";
import {
  RevenueRepository,
  type RevenueTransactionClient,
} from "../repositories/revenue.repository";

@Injectable()
export class RevenueCommandService {
  constructor(private readonly revenueRepository: RevenueRepository) {}

  async createReceivable(dto: CreateReceivableDto, user: AuthenticatedRequestUser) {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    const dueDate = new Date(dto.dueDate);
    this.assertValidPeriod(periodStart, periodEnd, dueDate);

    await this.assertReceivableReferences(dto);

    return this.revenueRepository.transaction(async (transaction) => {
      const receivable = await this.revenueRepository.createReceivable(transaction, {
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

    const contract = await this.revenueRepository.findContractForReceivables(dto.leaseContractId);

    if (!contract) {
      throw new NotFoundException("Lease contract not found");
    }

    if (contract.status === LeaseContractStatus.CANCELED || contract.status === LeaseContractStatus.ENDED) {
      throw new BadRequestException("Cannot generate receivables for inactive contract");
    }

    const meterReading = dto.meterReadingId
      ? await this.revenueRepository.findMeterReadingById(dto.meterReadingId)
      : await this.revenueRepository.findMeterReadingByRoomAndPeriod({
          roomId: contract.roomId,
          periodStart,
          periodEnd,
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

    return this.revenueRepository.transaction(async (transaction) => {
      const created = [];

      for (const item of items) {
        const amount = new Prisma.Decimal(item.amount);
        const receivable = await this.revenueRepository.createReceivable(transaction, {
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
        });

        await this.createChangeLog(transaction, receivable.id, user.id, RevenueChangeAction.CREATED, null, receivable, dto.note);
        created.push(receivable);
      }

      return { items: created, total: created.length };
    });
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

    return this.revenueRepository.transaction(async (transaction) => {
      const updated = await this.revenueRepository.updateReceivable(transaction, id, {
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

    return this.revenueRepository.transaction(async (transaction) => {
      const updated = await this.revenueRepository.updateReceivable(transaction, id, {
        status: RevenueReceivableStatus.CANCELED,
        remainingAmount: 0,
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

    return this.revenueRepository.transaction(async (transaction) => {
      const payment = await this.revenueRepository.createPayment(transaction, {
        receivableId: id,
        amount,
        method: dto.method ?? RevenuePaymentMethod.BANK_TRANSFER,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        transactionCode: dto.transactionCode,
        evidenceUrl: dto.evidenceUrl,
        evidenceNote: dto.evidenceNote,
        verifiedById: user.id,
        note: dto.note,
      });

      const paidAmount = receivable.paidAmount.plus(amount);
      const remainingAmount = receivable.amount.minus(paidAmount);
      const status = this.calculateStatus(receivable.amount, paidAmount);
      const updated = await this.revenueRepository.updateReceivable(transaction, id, {
        paidAmount,
        remainingAmount,
        status,
      });

      await this.createChangeLog(transaction, id, user.id, RevenueChangeAction.PAYMENT_RECORDED, receivable, { receivable: updated, payment }, dto.note);

      return { receivable: updated, payment };
    });
  }

  private async assertReceivableReferences(dto: {
    apartmentId: string;
    roomId: string;
    customerId: string;
    leaseContractId: string;
    meterReadingId?: string;
  }): Promise<void> {
    const [contract, meterReading] = await Promise.all([
      this.revenueRepository.findContractReference(dto.leaseContractId),
      dto.meterReadingId
        ? this.revenueRepository.findMeterReadingReference(dto.meterReadingId)
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
    const receivable = await this.revenueRepository.findReceivableById(id);

    if (!receivable) {
      throw new NotFoundException("Receivable not found");
    }

    return receivable;
  }

  private async createChangeLog(
    transaction: RevenueTransactionClient,
    receivableId: string,
    changedById: string | null,
    action: RevenueChangeAction,
    beforeData: unknown,
    afterData: unknown,
    note?: string,
  ): Promise<void> {
    await this.revenueRepository.createChangeLog(transaction, {
      receivableId,
      changedById,
      action,
      beforeData: this.toInputJsonValue(beforeData),
      afterData: this.toInputJsonValue(afterData),
      note,
    });
  }

  private toInputJsonValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
    if (value === null || typeof value === "undefined") {
      return Prisma.JsonNull;
    }

    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private async generateNextReceivableCode(transaction: RevenueTransactionClient): Promise<string> {
    const count = await this.revenueRepository.countReceivables(transaction);

    for (let index = count + 1; index < count + 1000; index += 1) {
      const code = `REV-${String(index).padStart(6, "0")}`;
      const existing = await this.revenueRepository.findReceivableCode(transaction, code);

      if (!existing) {
        return code;
      }
    }

    throw new BadRequestException("Cannot generate receivable code");
  }

  private formatPeriodLabel(periodStart: Date, periodEnd: Date): string {
    return `${periodStart.toISOString().slice(0, 10)} to ${periodEnd.toISOString().slice(0, 10)}`;
  }
}
