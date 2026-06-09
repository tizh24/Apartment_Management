import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CommissionStatus,
  CustomerStatus,
  LeaseContractChangeAction,
  LeaseContractStatus,
  Prisma,
  RoomStatus,
  SaleContractStatus,
  UserRole,
} from "@prisma/client";

import { PrismaService } from "../../shared/database/prisma.service";
import type { AuthenticatedRequestUser } from "../auth/auth.types";
import type {
  CancelContractDto,
  EndContractEarlyDto,
  ExtendContractDto,
} from "./dto/contract-action.dto";
import type { CreateContractDto } from "./dto/create-contract.dto";
import type { CreateContractFileDto } from "./dto/create-contract-file.dto";
import type { QueryContractsDto } from "./dto/query-contracts.dto";
import type { QueryExpiringContractsDto } from "./dto/query-expiring-contracts.dto";
import type { UpdateContractDto } from "./dto/update-contract.dto";

type TransactionClient = Prisma.TransactionClient;

@Injectable()
export class ContractsService {
  constructor(private readonly prismaService: PrismaService) {}

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

    return this.prismaService.$transaction(async (transaction) => {
      const customerId = dto.customerId ?? (await this.createCustomerForContract(transaction, dto));
      const contract = await transaction.leaseContract.create({
        data: {
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
        },
        include: this.contractInclude,
      });

      await this.createSaleContractIfNeeded(transaction, contract);
      await this.syncRoomAndCustomerAfterContractChange(transaction, contract);
      await this.createChangeLog(transaction, contract.id, user.id, LeaseContractChangeAction.CREATED, null, contract, dto.note);

      return contract;
    });
  }

  async findAll(query: QueryContractsDto, user: AuthenticatedRequestUser) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = await this.buildContractWhere(query, user);

    const [items, total] = await this.prismaService.$transaction([
      this.prismaService.leaseContract.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ startDate: "desc" }],
        include: this.contractInclude,
      }),
      this.prismaService.leaseContract.count({ where }),
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

  async findOne(id: string, user: AuthenticatedRequestUser) {
    const contract = await this.prismaService.leaseContract.findUnique({
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

    if (!contract) {
      throw new NotFoundException("Lease contract not found");
    }

    this.assertCanReadContract(contract, user);

    return contract;
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

    return this.prismaService.$transaction(async (transaction) => {
      const updated = await transaction.leaseContract.update({
        where: { id },
        data: {
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
        },
        include: this.contractInclude,
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

    return this.prismaService.$transaction(async (transaction) => {
      const updated = await transaction.leaseContract.update({
        where: { id },
        data: {
          endDate,
          rentDurationMonths: dto.rentDurationMonths,
        },
        include: this.contractInclude,
      });

      await this.createChangeLog(transaction, id, user.id, LeaseContractChangeAction.EXTENDED, existing, updated, dto.note);

      return updated;
    });
  }

  async endEarly(id: string, dto: EndContractEarlyDto, user: AuthenticatedRequestUser) {
    const existing = await this.ensureContractExists(id);
    const endDate = new Date(dto.endDate);
    this.assertValidDateRange(existing.startDate, endDate);

    return this.prismaService.$transaction(async (transaction) => {
      const updated = await transaction.leaseContract.update({
        where: { id },
        data: {
          endDate,
          status: LeaseContractStatus.ENDED,
        },
        include: this.contractInclude,
      });

      await this.syncRoomAndCustomerAfterContractChange(transaction, updated);
      await this.createChangeLog(transaction, id, user.id, LeaseContractChangeAction.ENDED_EARLY, existing, updated, dto.note);

      return updated;
    });
  }

  async cancel(id: string, dto: CancelContractDto, user: AuthenticatedRequestUser) {
    const existing = await this.ensureContractExists(id);

    return this.prismaService.$transaction(async (transaction) => {
      const updated = await transaction.leaseContract.update({
        where: { id },
        data: { status: LeaseContractStatus.CANCELED },
        include: this.contractInclude,
      });

      await this.syncRoomAndCustomerAfterContractChange(transaction, updated);
      await this.createChangeLog(transaction, id, user.id, LeaseContractChangeAction.CANCELED, existing, updated, dto.note);

      return updated;
    });
  }

  async createFile(id: string, dto: CreateContractFileDto, user: AuthenticatedRequestUser) {
    await this.ensureContractExists(id);

    return this.prismaService.$transaction(async (transaction) => {
      const file = await transaction.leaseContractFile.create({
        data: {
          leaseContractId: id,
          fileName: dto.fileName,
          fileUrl: dto.fileUrl,
          mimeType: dto.mimeType,
          size: dto.size,
          note: dto.note,
        },
      });

      await this.createChangeLog(transaction, id, user.id, LeaseContractChangeAction.FILE_ADDED, null, file, dto.note);

      return file;
    });
  }

  async findExpiring(query: QueryExpiringContractsDto, user: AuthenticatedRequestUser) {
    this.assertAllowedExpiringDays(query.days);

    const now = new Date();
    const until = new Date(now);
    until.setDate(until.getDate() + query.days);
    const saleProfileId = await this.getReadableSaleProfileId(user);

    return this.prismaService.leaseContract.findMany({
      where: {
        status: { in: [LeaseContractStatus.ACTIVE, LeaseContractStatus.RESERVED] },
        endDate: { gte: now, lte: until },
        ...(query.apartmentId ? { apartmentId: query.apartmentId } : {}),
        ...(saleProfileId ? { saleProfileId } : {}),
      },
      orderBy: { endDate: "asc" },
      include: this.contractInclude,
    });
  }

  async findChangeLogs(id: string) {
    await this.ensureContractExists(id);

    return this.prismaService.leaseContractChangeLog.findMany({
      where: { leaseContractId: id },
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

  private readonly contractInclude = {
    apartment: { select: { id: true, shortId: true, name: true } },
    room: { select: { id: true, shortId: true, code: true, floor: true, status: true } },
    customer: { select: { id: true, fullName: true, phoneNumber: true, status: true } },
    saleProfile: { select: { id: true, userId: true, fullName: true, phoneNumber: true } },
    _count: { select: { files: true, changeLogs: true } },
  } satisfies Prisma.LeaseContractInclude;

  private async buildContractWhere(
    query: QueryContractsDto,
    user: AuthenticatedRequestUser,
  ): Promise<Prisma.LeaseContractWhereInput> {
    const saleProfileId = await this.getReadableSaleProfileId(user, query.saleProfileId);
    const where: Prisma.LeaseContractWhereInput = {
      ...(query.apartmentId ? { apartmentId: query.apartmentId } : {}),
      ...(query.roomId ? { roomId: query.roomId } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(saleProfileId ? { saleProfileId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            startDate: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    if (query.search) {
      where.OR = [
        { contractCode: { contains: query.search, mode: "insensitive" } },
        { customer: { fullName: { contains: query.search, mode: "insensitive" } } },
        { customer: { phoneNumber: { contains: query.search, mode: "insensitive" } } },
        { room: { code: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    return where;
  }

  private async assertNoRoomConflict(
    roomId: string,
    startDate: Date,
    endDate: Date,
    excludingContractId?: string,
  ): Promise<void> {
    const conflict = await this.prismaService.leaseContract.findFirst({
      where: {
        roomId,
        status: { in: [LeaseContractStatus.RESERVED, LeaseContractStatus.ACTIVE] },
        ...(excludingContractId ? { id: { not: excludingContractId } } : {}),
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
      select: { contractCode: true },
    });

    if (conflict) {
      throw new BadRequestException(`Room has active contract conflict: ${conflict.contractCode}`);
    }
  }

  private async syncRoomAndCustomerAfterContractChange(
    transaction: TransactionClient,
    contract: { id: string; roomId: string; customerId: string; startDate: Date; endDate: Date; status: LeaseContractStatus },
  ): Promise<void> {
    const now = new Date();
    const isUsable =
      contract.status === LeaseContractStatus.RESERVED ||
      contract.status === LeaseContractStatus.ACTIVE;
    const isCurrent = isUsable && contract.startDate <= now && contract.endDate >= now;
    const roomStatus = isCurrent ? RoomStatus.OCCUPIED : isUsable ? RoomStatus.RESERVED : RoomStatus.VACANT;

    await transaction.room.update({
      where: { id: contract.roomId },
      data: { status: roomStatus },
    });

    if (isUsable) {
      await transaction.customer.update({
        where: { id: contract.customerId },
        data: {
          status: CustomerStatus.RENTING,
          currentRoomId: contract.roomId,
        },
      });
      return;
    }

    const otherActiveContract = await transaction.leaseContract.findFirst({
      where: {
        customerId: contract.customerId,
        id: { not: contract.id },
        status: { in: [LeaseContractStatus.RESERVED, LeaseContractStatus.ACTIVE] },
      },
      select: { roomId: true },
      orderBy: { startDate: "desc" },
    });

    await transaction.customer.update({
      where: { id: contract.customerId },
      data: {
        status: otherActiveContract ? CustomerStatus.RENTING : CustomerStatus.ENDED,
        currentRoomId: otherActiveContract?.roomId ?? null,
      },
    });
  }

  private async createSaleContractIfNeeded(
    transaction: TransactionClient,
    contract: { contractCode: string; saleProfileId: string | null; apartmentId: string; roomId: string; customer: { fullName: string; phoneNumber: string }; startDate: Date; endDate: Date; monthlyRent: Prisma.Decimal; commissionAmount: Prisma.Decimal | null },
  ): Promise<void> {
    if (!contract.saleProfileId || !contract.commissionAmount) {
      return;
    }

    await transaction.saleContract.upsert({
      where: { contractCode: `SALE-${contract.contractCode}` },
      update: {
        saleId: contract.saleProfileId,
        apartmentId: contract.apartmentId,
        roomId: contract.roomId,
        customerName: contract.customer.fullName,
        customerPhone: contract.customer.phoneNumber,
        startDate: contract.startDate,
        endDate: contract.endDate,
        contractValue: contract.monthlyRent,
        commissionAmount: contract.commissionAmount,
      },
      create: {
        contractCode: `SALE-${contract.contractCode}`,
        saleId: contract.saleProfileId,
        apartmentId: contract.apartmentId,
        roomId: contract.roomId,
        customerName: contract.customer.fullName,
        customerPhone: contract.customer.phoneNumber,
        startDate: contract.startDate,
        endDate: contract.endDate,
        contractValue: contract.monthlyRent,
        commissionAmount: contract.commissionAmount,
        contractStatus: SaleContractStatus.ACTIVE,
        commissionStatus: CommissionStatus.UNPAID,
        note: "Generated from lease contract.",
      },
    });
  }

  private async createChangeLog(
    transaction: TransactionClient,
    leaseContractId: string,
    changedById: string | null,
    action: LeaseContractChangeAction,
    beforeData: unknown,
    afterData: unknown,
    note?: string,
  ): Promise<void> {
    await transaction.leaseContractChangeLog.create({
      data: {
        leaseContractId,
        changedById,
        action,
        beforeData: beforeData as Prisma.InputJsonValue,
        afterData: afterData as Prisma.InputJsonValue,
        note,
      },
    });
  }

  private async ensureContractExists(id: string) {
    const contract = await this.prismaService.leaseContract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException("Lease contract not found");
    }

    return contract;
  }

  private async ensureRoomExists(id: string) {
    const room = await this.prismaService.room.findUnique({
      where: { id },
      select: { id: true, apartmentId: true },
    });

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return room;
  }

  private async ensureCustomerExists(id: string) {
    const customer = await this.prismaService.customer.findUnique({
      where: { id },
      select: { id: true, apartmentId: true },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    return customer;
  }

  private async ensureSaleProfileExists(id: string): Promise<void> {
    const sale = await this.prismaService.saleProfile.findUnique({
      where: { id },
      select: { id: true },
    });

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
    transaction: TransactionClient,
    dto: CreateContractDto,
  ): Promise<string> {
    if (!dto.newCustomer) {
      throw new BadRequestException("New customer data is required");
    }

    const customerId = await this.generateNextCustomerId(transaction);
    const customer = await transaction.customer.create({
      data: {
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
      },
      select: { id: true },
    });

    return customer.id;
  }

  private async generateNextCustomerId(transaction: TransactionClient): Promise<string> {
    const customerCount = await transaction.customer.count();

    for (let index = customerCount + 1; index < customerCount + 1000; index += 1) {
      const customerId = `customer-${String(index).padStart(6, "0")}`;
      const existingCustomer = await transaction.customer.findUnique({
        where: { id: customerId },
        select: { id: true },
      });

      if (!existingCustomer) {
        return customerId;
      }
    }

    throw new BadRequestException("Cannot generate customer id");
  }

  private async getReadableSaleProfileId(
    user: AuthenticatedRequestUser,
    requestedSaleProfileId?: string,
  ): Promise<string | undefined> {
    if (user.role !== UserRole.SALE) {
      return requestedSaleProfileId;
    }

    const sale = await this.prismaService.saleProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!sale) {
      throw new ForbiddenException("Current user is not linked to a sale profile");
    }

    if (requestedSaleProfileId && requestedSaleProfileId !== sale.id) {
      throw new ForbiddenException("Cannot access another sale profile's contracts");
    }

    return sale.id;
  }

  private assertCanReadContract(
    contract: { saleProfile: { userId: string | null } | null },
    user: AuthenticatedRequestUser,
  ): void {
    if (user.role !== UserRole.SALE) {
      return;
    }

    if (contract.saleProfile?.userId !== user.id) {
      throw new ForbiddenException("Cannot access another sale profile's contract");
    }
  }

  private assertValidDateRange(startDate: Date, endDate: Date): void {
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException("Invalid contract date");
    }

    if (endDate <= startDate) {
      throw new BadRequestException("End date must be after start date");
    }
  }

  private assertAllowedExpiringDays(days: number): void {
    if (![3, 5, 7].includes(days)) {
      throw new BadRequestException("Expiring alert days must be 3, 5, or 7");
    }
  }

  private getInitialStatus(startDate: Date): LeaseContractStatus {
    return startDate <= new Date()
      ? LeaseContractStatus.ACTIVE
      : LeaseContractStatus.RESERVED;
  }

  private async generateNextContractCode(): Promise<string> {
    const count = await this.prismaService.leaseContract.count();

    return `LEASE-${String(count + 1).padStart(6, "0")}`;
  }
}
