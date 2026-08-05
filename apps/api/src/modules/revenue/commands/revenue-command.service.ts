import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  RevenueChangeAction,
  RevenuePaymentMethod,
  RevenueReceivableStatus,
  RevenueReceivableType,
} from "@prisma/client";

import type { AuthenticatedRequestUser } from "../../auth/auth.types";
import type { CreatePeriodReceivablesDto } from "../dto/create-period-receivables.dto";
import type { CreateReceivablePaymentDto } from "../dto/create-receivable-payment.dto";
import type { CreateReceivableDto } from "../dto/create-receivable.dto";
import type { UpdateReceivableDto } from "../dto/update-receivable.dto";
import {
  RevenueRepository,
  type RevenueTransactionClient,
} from "../repositories/revenue.repository";

@Injectable()
export class RevenueCommandService {
  constructor(private readonly revenueRepository: RevenueRepository) {}

  async createReceivable(
    dto: CreateReceivableDto,
    user: AuthenticatedRequestUser,
  ) {
    await this.assertReceivableRelations(dto);
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    const dueDate = new Date(dto.dueDate);
    this.assertValidDateRange(periodStart, periodEnd);
    const amount = new Prisma.Decimal(dto.amount);
    this.assertPositiveAmount(amount);

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
        amount,
        paidAmount: 0,
        remainingAmount: amount,
        periodStart,
        periodEnd,
        dueDate,
        status: RevenueReceivableStatus.UNPAID,
        note: dto.note,
      });

      await this.createChangeLog(transaction, receivable.id, user.id, RevenueChangeAction.CREATED, null, receivable, dto.note);

      return receivable;
    });
  }

  async updateReceivable(
    id: string,
    dto: UpdateReceivableDto,
    user: AuthenticatedRequestUser,
  ) {
    const existing = await this.ensureReceivableExists(id);

    if (existing.status === RevenueReceivableStatus.PAID) {
      throw new BadRequestException("Paid receivable cannot be edited");
    }

    const nextRelationInput = {
      apartmentId: dto.apartmentId ?? existing.apartmentId,
      roomId: dto.roomId ?? existing.roomId,
      customerId: dto.customerId ?? existing.customerId,
      leaseContractId: dto.leaseContractId ?? existing.leaseContractId,
      meterReadingId: dto.meterReadingId ?? existing.meterReadingId ?? undefined,
    };
    await this.assertReceivableRelations(nextRelationInput);

    const amount = dto.amount !== undefined ? new Prisma.Decimal(dto.amount) : existing.amount;
    this.assertPositiveAmount(amount);

    if (amount.lt(existing.paidAmount)) {
      throw new BadRequestException("Amount cannot be less than paid amount");
    }

    const periodStart = dto.periodStart ? new Date(dto.periodStart) : existing.periodStart;
    const periodEnd = dto.periodEnd ? new Date(dto.periodEnd) : existing.periodEnd;
    this.assertValidDateRange(periodStart, periodEnd);
    const remainingAmount = amount.minus(existing.paidAmount);

    return this.revenueRepository.transaction(async (transaction) => {
      const updated = await this.revenueRepository.updateReceivable(transaction, id, {
        apartmentId: dto.apartmentId,
        roomId: dto.roomId,
        customerId: dto.customerId,
        leaseContractId: dto.leaseContractId,
        meterReadingId: dto.meterReadingId,
        type: dto.type,
        description: dto.description,
        amount,
        remainingAmount,
        status: this.getStatus(existing.paidAmount, remainingAmount),
        periodStart: dto.periodStart ? periodStart : undefined,
        periodEnd: dto.periodEnd ? periodEnd : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        note: dto.note,
      });

      await this.createChangeLog(transaction, id, user.id, RevenueChangeAction.UPDATED, existing, updated, dto.note);

      return updated;
    });
  }

  async createPeriodReceivables(
    dto: CreatePeriodReceivablesDto,
    user: AuthenticatedRequestUser,
  ) {
    const contract = await this.revenueRepository.findLeaseContractForReceivable(dto.leaseContractId);

    if (!contract) {
      throw new NotFoundException("Lease contract not found");
    }

    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);
    const dueDate = new Date(dto.dueDate);
    this.assertValidDateRange(periodStart, periodEnd);

    const items: Array<Omit<Prisma.RevenueReceivableUncheckedCreateInput, "receivableCode">> = [];

    if (dto.includeRent) {
      items.push(this.buildReceivableInput({
        apartmentId: contract.apartmentId,
        roomId: contract.roomId,
        customerId: contract.customerId,
        leaseContractId: contract.id,
        type: RevenueReceivableType.RENT,
        description: `Room rent ${contract.contractCode}`,
        amount: contract.monthlyRent,
        periodStart,
        periodEnd,
        dueDate,
        note: dto.note,
      }));
    }

    const meterReading = dto.meterReadingId
      ? await this.revenueRepository.findMeterReadingById(dto.meterReadingId)
      : await this.revenueRepository.findMeterReadingByRoomAndPeriod(contract.roomId, periodStart, periodEnd);

    if (dto.includeUtilities && meterReading) {
      if (meterReading.roomId !== contract.roomId) {
        throw new BadRequestException("Meter reading does not belong to contract room");
      }

      const fullMeterReading = dto.meterReadingId
        ? await this.revenueRepository.findMeterReadingByRoomAndPeriod(contract.roomId, periodStart, periodEnd)
        : meterReading;

      if (fullMeterReading && "electricityUsage" in fullMeterReading) {
        const electricityAmount = fullMeterReading.electricityUsage.mul(fullMeterReading.electricityUnitPrice);
        const waterAmount = fullMeterReading.waterUsage.mul(fullMeterReading.waterUnitPrice);

        if (electricityAmount.gt(0)) {
          items.push(this.buildReceivableInput({
            apartmentId: contract.apartmentId,
            roomId: contract.roomId,
            customerId: contract.customerId,
            leaseContractId: contract.id,
            meterReadingId: fullMeterReading.id,
            type: RevenueReceivableType.ELECTRICITY,
            description: `Electricity ${contract.contractCode}`,
            amount: electricityAmount,
            periodStart,
            periodEnd,
            dueDate,
            note: dto.note,
          }));
        }

        if (waterAmount.gt(0)) {
          items.push(this.buildReceivableInput({
            apartmentId: contract.apartmentId,
            roomId: contract.roomId,
            customerId: contract.customerId,
            leaseContractId: contract.id,
            meterReadingId: fullMeterReading.id,
            type: RevenueReceivableType.WATER,
            description: `Water ${contract.contractCode}`,
            amount: waterAmount,
            periodStart,
            periodEnd,
            dueDate,
            note: dto.note,
          }));
        }
      }
    }

    if (dto.serviceAmount && dto.serviceAmount > 0) {
      items.push(this.buildReceivableInput({
        apartmentId: contract.apartmentId,
        roomId: contract.roomId,
        customerId: contract.customerId,
        leaseContractId: contract.id,
        type: RevenueReceivableType.SERVICE,
        description: `Service fee ${contract.contractCode}`,
        amount: new Prisma.Decimal(dto.serviceAmount),
        periodStart,
        periodEnd,
        dueDate,
        note: dto.note,
      }));
    }

    if (dto.otherAmount && dto.otherAmount > 0) {
      items.push(this.buildReceivableInput({
        apartmentId: contract.apartmentId,
        roomId: contract.roomId,
        customerId: contract.customerId,
        leaseContractId: contract.id,
        type: RevenueReceivableType.OTHER,
        description: `Other fee ${contract.contractCode}`,
        amount: new Prisma.Decimal(dto.otherAmount),
        periodStart,
        periodEnd,
        dueDate,
        note: dto.note,
      }));
    }

    if (items.length === 0) {
      throw new BadRequestException("No receivables can be generated for this period");
    }

    return this.revenueRepository.transaction(async (transaction) => {
      const created = [];

      for (const item of items) {
        const receivable = await this.revenueRepository.createReceivable(transaction, {
          ...item,
          receivableCode: await this.generateNextReceivableCode(transaction),
        });
        await this.createChangeLog(transaction, receivable.id, user.id, RevenueChangeAction.CREATED, null, receivable, dto.note);
        created.push(receivable);
      }

      return { items: created, total: created.length };
    });
  }

  async createPayment(
    receivableId: string,
    dto: CreateReceivablePaymentDto,
    user: AuthenticatedRequestUser,
  ) {
    const receivable = await this.ensureReceivableExists(receivableId);

    if (receivable.status === RevenueReceivableStatus.CANCELED) {
      throw new BadRequestException("Canceled receivable cannot be paid");
    }

    if (receivable.status === RevenueReceivableStatus.PAID) {
      throw new BadRequestException("Receivable is already paid");
    }

    const paymentAmount = new Prisma.Decimal(dto.amount);
    this.assertPositiveAmount(paymentAmount);

    if (paymentAmount.gt(receivable.remainingAmount)) {
      throw new BadRequestException("Payment amount exceeds remaining amount");
    }

    const paidAmount = receivable.paidAmount.plus(paymentAmount);
    const remainingAmount = receivable.amount.minus(paidAmount);

    return this.revenueRepository.transaction(async (transaction) => {
      const payment = await this.revenueRepository.createPayment(transaction, {
        receivableId,
        amount: paymentAmount,
        method: dto.method ?? RevenuePaymentMethod.BANK_TRANSFER,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        transactionCode: dto.transactionCode,
        evidenceUrl: dto.evidenceUrl,
        evidenceNote: dto.evidenceNote,
        verifiedById: user.id,
        note: dto.note,
      });

      const updatedReceivable = await this.revenueRepository.updateReceivable(transaction, receivableId, {
        paidAmount,
        remainingAmount,
        status: this.getStatus(paidAmount, remainingAmount),
      });

      await this.createChangeLog(transaction, receivableId, user.id, RevenueChangeAction.PAYMENT_RECORDED, receivable, { receivable: updatedReceivable, payment }, dto.note);

      return { payment, receivable: updatedReceivable };
    });
  }

  private buildReceivableInput(params: {
    apartmentId: string;
    roomId: string;
    customerId: string;
    leaseContractId: string;
    meterReadingId?: string;
    type: RevenueReceivableType;
    description: string;
    amount: Prisma.Decimal;
    periodStart: Date;
    periodEnd: Date;
    dueDate: Date;
    note?: string;
  }): Omit<Prisma.RevenueReceivableUncheckedCreateInput, "receivableCode"> {
    return {
      ...params,
      paidAmount: 0,
      remainingAmount: params.amount,
      status: RevenueReceivableStatus.UNPAID,
    };
  }

  private async assertReceivableRelations(dto: {
    apartmentId: string;
    roomId: string;
    customerId: string;
    leaseContractId: string;
    meterReadingId?: string;
  }): Promise<void> {
    const [apartment, room, customer, leaseContract, meterReading] = await Promise.all([
      this.revenueRepository.findApartment(dto.apartmentId),
      this.revenueRepository.findRoom(dto.roomId),
      this.revenueRepository.findCustomer(dto.customerId),
      this.revenueRepository.findLeaseContract(dto.leaseContractId),
      dto.meterReadingId ? this.revenueRepository.findMeterReadingById(dto.meterReadingId) : null,
    ]);

    if (!apartment) throw new NotFoundException("Apartment not found");
    if (!room) throw new NotFoundException("Room not found");
    if (!customer) throw new NotFoundException("Customer not found");
    if (!leaseContract) throw new NotFoundException("Lease contract not found");

    if (room.apartmentId !== dto.apartmentId) throw new BadRequestException("Room does not belong to apartment");
    if (customer.apartmentId !== dto.apartmentId) throw new BadRequestException("Customer does not belong to apartment");

    if (leaseContract.apartmentId !== dto.apartmentId || leaseContract.roomId !== dto.roomId || leaseContract.customerId !== dto.customerId) {
      throw new BadRequestException("Lease contract does not match apartment, room, and customer");
    }

    if (dto.meterReadingId && !meterReading) throw new NotFoundException("Meter reading not found");
    if (meterReading && meterReading.roomId !== dto.roomId) throw new BadRequestException("Meter reading does not belong to room");
  }

  private async ensureReceivableExists(id: string) {
    const receivable = await this.revenueRepository.findById(id);

    if (!receivable) {
      throw new NotFoundException("Receivable not found");
    }

    return receivable;
  }

  private assertPositiveAmount(amount: Prisma.Decimal): void {
    if (amount.lte(0)) {
      throw new BadRequestException("Amount must be greater than 0");
    }
  }

  private assertValidDateRange(startDate: Date, endDate: Date): void {
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException("Invalid period date");
    }

    if (endDate < startDate) {
      throw new BadRequestException("Period end must be after period start");
    }
  }

  private getStatus(paidAmount: Prisma.Decimal, remainingAmount: Prisma.Decimal): RevenueReceivableStatus {
    if (remainingAmount.equals(0)) return RevenueReceivableStatus.PAID;
    if (paidAmount.gt(0)) return RevenueReceivableStatus.PARTIALLY_PAID;
    return RevenueReceivableStatus.UNPAID;
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

      if (!existing) return code;
    }

    throw new BadRequestException("Cannot generate receivable code");
  }
}