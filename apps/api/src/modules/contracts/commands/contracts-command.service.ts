import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CustomerStatus,
  LeaseContractChangeAction,
  LeaseContractStatus,
  Prisma,
  RoomStatus,
} from "@prisma/client";

import type { AuthenticatedRequestUser } from "../../auth/auth.types";
import type {
  CancelContractDto,
  EndContractEarlyDto,
  ExtendContractDto,
} from "../dto/contract-action.dto";
import type { CreateContractDto } from "../dto/create-contract.dto";
import type { CreateContractFileDto } from "../dto/create-contract-file.dto";
import type { UpdateContractDto } from "../dto/update-contract.dto";
import {
  ContractsRepository,
  type ContractsTransactionClient,
} from "../repositories/contracts.repository";

@Injectable()
export class ContractsCommandService {
  constructor(private readonly contractsRepository: ContractsRepository) {}

  async create(dto: CreateContractDto, user: AuthenticatedRequestUser) {
    this.assertCreateCustomerSelection(dto);

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    this.assertValidDateRange(startDate, endDate);

    const [room, customer] = await Promise.all([
      this.ensureRoomExists(dto.roomId),
      dto.customerId ? this.ensureCustomerExists(dto.customerId) : null,
      dto.saleProfileId ? this.ensureSaleProfileExists(dto.saleProfileId) : null,
    ]);

    if (room.apartmentId !== dto.apartmentId) {
      throw new BadRequestException("Room does not belong to apartment");
    }

    if (customer && customer.apartmentId !== dto.apartmentId) {
      throw new BadRequestException("Customer does not belong to apartment");
    }

    await this.assertNoRoomConflict(dto.roomId, startDate, endDate);

    const contractCode = dto.contractCode ?? await this.generateNextContractCode();
    const status = dto.status ?? this.getInitialStatus(startDate);

    return this.contractsRepository.transaction(async (transaction) => {
      const customerId = dto.customerId ?? (await this.createCustomerForContract(transaction, dto));
      const contract = await this.contractsRepository.createContract(transaction, {
        contractCode,
        apartmentId: dto.apartmentId,
        roomId: dto.roomId,
        customerId,
        saleProfileId: dto.saleProfileId,
        startDate,
        endDate,
        rentDurationMonths: dto.rentDurationMonths,
        monthlyRent: dto.monthlyRent,
        depositAmount: dto.depositAmount ?? 0,
        terms: dto.terms,
        commissionAmount: dto.commissionAmount,
        status,
        note: dto.note,
      });

      await this.createSaleContractIfNeeded(transaction, contract);
      await this.syncRoomAndCustomerAfterContractChange(transaction, contract);
      await this.createChangeLog(transaction, contract.id, user.id, LeaseContractChangeAction.CREATED, null, contract, dto.note);

      return contract;
    });
  }

  async update(id: string, dto: UpdateContractDto, user: AuthenticatedRequestUser) {
    const existing = await this.ensureContractExists(id);
    const startDate = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : existing.endDate;
    this.assertValidDateRange(startDate, endDate);

    const apartmentId = dto.apartmentId ?? existing.apartmentId;
    const roomId = dto.roomId ?? existing.roomId;
    const customerId = dto.customerId ?? existing.customerId;

    const [room, customer] = await Promise.all([
      this.ensureRoomExists(roomId),
      this.ensureCustomerExists(customerId),
      dto.saleProfileId ? this.ensureSaleProfileExists(dto.saleProfileId) : null,
    ]);

    if (room.apartmentId !== apartmentId) {
      throw new BadRequestException("Room does not belong to apartment");
    }

    if (customer.apartmentId !== apartmentId) {
      throw new BadRequestException("Customer does not belong to apartment");
    }

    await this.assertNoRoomConflict(roomId, startDate, endDate, id);

    return this.contractsRepository.transaction(async (transaction) => {
      const updated = await this.contractsRepository.updateContract(transaction, id, {
        contractCode: dto.contractCode,
        apartmentId: dto.apartmentId,
        roomId: dto.roomId,
        customerId: dto.customerId,
        saleProfileId: dto.saleProfileId,
        startDate: dto.startDate ? startDate : undefined,
        endDate: dto.endDate ? endDate : undefined,
        rentDurationMonths: dto.rentDurationMonths,
        monthlyRent: dto.monthlyRent,
        depositAmount: dto.depositAmount,
        terms: dto.terms,
        commissionAmount: dto.commissionAmount,
        status: dto.status,
        note: dto.note,
      });

      await this.syncRoomAndCustomerAfterContractChange(transaction, updated);
      await this.createChangeLog(transaction, id, user.id, LeaseContractChangeAction.UPDATED, existing, updated, dto.note);

      return updated;
    });
  }

  async extend(id: string, dto: ExtendContractDto, user: AuthenticatedRequestUser) {
    const existing = await this.ensureContractExists(id);
    const endDate = new Date(dto.endDate);
    this.assertValidDateRange(existing.startDate, endDate);
    await this.assertNoRoomConflict(existing.roomId, existing.startDate, endDate, id);

    return this.contractsRepository.transaction(async (transaction) => {
      const updated = await this.contractsRepository.updateContract(transaction, id, {
        endDate,
        rentDurationMonths: dto.rentDurationMonths,
      });

      await this.createChangeLog(transaction, id, user.id, LeaseContractChangeAction.EXTENDED, existing, updated, dto.note);

      return updated;
    });
  }

  async endEarly(id: string, dto: EndContractEarlyDto, user: AuthenticatedRequestUser) {
    const existing = await this.ensureContractExists(id);
    const endDate = new Date(dto.endDate);
    this.assertValidDateRange(existing.startDate, endDate);

    return this.contractsRepository.transaction(async (transaction) => {
      const updated = await this.contractsRepository.updateContract(transaction, id, {
        endDate,
        status: LeaseContractStatus.ENDED,
      });

      await this.syncRoomAndCustomerAfterContractChange(transaction, updated);
      await this.createChangeLog(transaction, id, user.id, LeaseContractChangeAction.ENDED_EARLY, existing, updated, dto.note);

      return updated;
    });
  }

  async cancel(id: string, dto: CancelContractDto, user: AuthenticatedRequestUser) {
    const existing = await this.ensureContractExists(id);

    return this.contractsRepository.transaction(async (transaction) => {
      const updated = await this.contractsRepository.updateContract(transaction, id, {
        status: LeaseContractStatus.CANCELED,
      });

      await this.syncRoomAndCustomerAfterContractChange(transaction, updated);
      await this.createChangeLog(transaction, id, user.id, LeaseContractChangeAction.CANCELED, existing, updated, dto.note);

      return updated;
    });
  }

  async createFile(id: string, dto: CreateContractFileDto, user: AuthenticatedRequestUser) {
    await this.ensureContractExists(id);

    return this.contractsRepository.transaction(async (transaction) => {
      const file = await this.contractsRepository.createContractFile(transaction, {
        leaseContractId: id,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        mimeType: dto.mimeType,
        size: dto.size,
        note: dto.note,
      });

      await this.createChangeLog(transaction, id, user.id, LeaseContractChangeAction.FILE_ADDED, null, file, dto.note);

      return file;
    });
  }

  private async assertNoRoomConflict(
    roomId: string,
    startDate: Date,
    endDate: Date,
    excludingContractId?: string,
  ): Promise<void> {
    const conflict = await this.contractsRepository.findRoomConflict({
      roomId,
      startDate,
      endDate,
      excludingContractId,
    });

    if (conflict) {
      throw new BadRequestException(`Room has active contract conflict: ${conflict.contractCode}`);
    }
  }

  private async syncRoomAndCustomerAfterContractChange(
    transaction: ContractsTransactionClient,
    contract: { id: string; roomId: string; customerId: string; startDate: Date; endDate: Date; status: LeaseContractStatus },
  ): Promise<void> {
    const now = new Date();
    const isUsable =
      contract.status === LeaseContractStatus.RESERVED ||
      contract.status === LeaseContractStatus.ACTIVE;
    const isCurrent = isUsable && contract.startDate <= now && contract.endDate >= now;
    const roomStatus = isCurrent ? RoomStatus.OCCUPIED : isUsable ? RoomStatus.RESERVED : RoomStatus.VACANT;

    await this.contractsRepository.updateRoomStatus(transaction, contract.roomId, roomStatus);

    if (isUsable) {
      await this.contractsRepository.updateCustomerRenting(transaction, contract.customerId, contract.roomId);
      return;
    }

    const otherActiveContract = await this.contractsRepository.findOtherActiveContract(
      transaction,
      contract.customerId,
      contract.id,
    );

    await this.contractsRepository.updateCustomerAfterInactiveContract(
      transaction,
      contract.customerId,
      otherActiveContract?.roomId ?? null,
    );
  }

  private async createSaleContractIfNeeded(
    transaction: ContractsTransactionClient,
    contract: { contractCode: string; saleProfileId: string | null; apartmentId: string; roomId: string; customer: { fullName: string; phoneNumber: string }; startDate: Date; endDate: Date; monthlyRent: Prisma.Decimal; commissionAmount: Prisma.Decimal | null },
  ): Promise<void> {
    if (!contract.saleProfileId || !contract.commissionAmount) {
      return;
    }

    await this.contractsRepository.upsertSaleContract(transaction, contract.contractCode, {
      saleId: contract.saleProfileId,
      apartmentId: contract.apartmentId,
      roomId: contract.roomId,
      customerName: contract.customer.fullName,
      customerPhone: contract.customer.phoneNumber,
      startDate: contract.startDate,
      endDate: contract.endDate,
      contractValue: contract.monthlyRent,
      commissionAmount: contract.commissionAmount,
    });
  }

  private async createChangeLog(
    transaction: ContractsTransactionClient,
    leaseContractId: string,
    changedById: string | null,
    action: LeaseContractChangeAction,
    beforeData: unknown,
    afterData: unknown,
    note?: string,
  ): Promise<void> {
    await this.contractsRepository.createChangeLog(transaction, {
      leaseContractId,
      changedById,
      action,
      beforeData: beforeData as Prisma.InputJsonValue,
      afterData: afterData as Prisma.InputJsonValue,
      note,
    });
  }

  private async ensureContractExists(id: string) {
    const contract = await this.contractsRepository.findById(id);

    if (!contract) {
      throw new NotFoundException("Lease contract not found");
    }

    return contract;
  }

  private async ensureRoomExists(id: string) {
    const room = await this.contractsRepository.findRoomById(id);

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return room;
  }

  private async ensureCustomerExists(id: string) {
    const customer = await this.contractsRepository.findCustomerById(id);

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    return customer;
  }

  private async ensureSaleProfileExists(id: string): Promise<void> {
    const sale = await this.contractsRepository.findSaleProfileById(id);

    if (!sale) {
      throw new NotFoundException("Sale profile not found");
    }
  }

  private assertCreateCustomerSelection(dto: CreateContractDto): void {
    if (dto.customerId && dto.newCustomer) {
      throw new BadRequestException("Provide either customerId or newCustomer, not both");
    }

    if (!dto.customerId && !dto.newCustomer) {
      throw new BadRequestException("Provide customerId for an existing customer or newCustomer for a new customer");
    }
  }

  private async createCustomerForContract(
    transaction: ContractsTransactionClient,
    dto: CreateContractDto,
  ): Promise<string> {
    if (!dto.newCustomer) {
      throw new BadRequestException("New customer data is required");
    }

    const customerId = await this.generateNextCustomerId(transaction);
    const customer = await this.contractsRepository.createCustomer(transaction, {
      id: customerId,
      apartmentId: dto.apartmentId,
      fullName: dto.newCustomer.fullName,
      dateOfBirth: dto.newCustomer.dateOfBirth
        ? new Date(dto.newCustomer.dateOfBirth)
        : undefined,
      phoneNumber: dto.newCustomer.phoneNumber,
      email: dto.newCustomer.email,
      nationality: dto.newCustomer.nationality,
      identityNumber: dto.newCustomer.identityNumber,
      passportNumber: dto.newCustomer.passportNumber,
      visaNumber: dto.newCustomer.visaNumber,
      status: CustomerStatus.ENDED,
      note: dto.newCustomer.note,
    });

    return customer.id;
  }

  private async generateNextCustomerId(transaction: ContractsTransactionClient): Promise<string> {
    const customerCount = await this.contractsRepository.countCustomers(transaction);

    for (let index = customerCount + 1; index < customerCount + 1000; index += 1) {
      const customerId = `customer-${String(index).padStart(6, "0")}`;
      const existingCustomer = await this.contractsRepository.findCustomerId(transaction, customerId);

      if (!existingCustomer) {
        return customerId;
      }
    }

    throw new BadRequestException("Cannot generate customer id");
  }

  private assertValidDateRange(startDate: Date, endDate: Date): void {
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException("Invalid contract date");
    }

    if (endDate <= startDate) {
      throw new BadRequestException("End date must be after start date");
    }
  }

  private getInitialStatus(startDate: Date): LeaseContractStatus {
    return startDate <= new Date()
      ? LeaseContractStatus.ACTIVE
      : LeaseContractStatus.RESERVED;
  }

  private async generateNextContractCode(): Promise<string> {
    const count = await this.contractsRepository.countContracts();

    return `LEASE-${String(count + 1).padStart(6, "0")}`;
  }
}
