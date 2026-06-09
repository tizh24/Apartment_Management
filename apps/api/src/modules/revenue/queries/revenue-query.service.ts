import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, RevenueReceivableStatus } from "@prisma/client";

import type { QueryReceivablesDto } from "../dto/query-receivables.dto";
import type { RevenueSummaryDto } from "../dto/revenue-summary.dto";
import { RevenueRepository } from "../repositories/revenue.repository";

@Injectable()
export class RevenueQueryService {
  constructor(private readonly revenueRepository: RevenueRepository) {}

  async findReceivables(query: QueryReceivablesDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = this.buildReceivableWhere(query);
    const { items, total } = await this.revenueRepository.findManyPaginated({
      where,
      skip,
      take: limit,
    });

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
    const receivable = await this.revenueRepository.findReceivableDetail(id);

    if (!receivable) {
      throw new NotFoundException("Receivable not found");
    }

    return receivable;
  }

  findPayments(query: RevenueSummaryDto) {
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

    return this.revenueRepository.findPayments(where);
  }

  async getSummary(query: RevenueSummaryDto) {
    const where = this.buildSummaryWhere(query);
    const [receivableTotal, paidTotal, remainingTotal, byStatus, byType] = await this.revenueRepository.getSummary(where);

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
    const items = await this.revenueRepository.findReceivablesForExport(where);
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

    return [header, ...rows]
      .map((row) => row.map((cell) => this.escapeCsv(cell)).join(","))
      .join("\n");
  }

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

  private escapeCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }
}
