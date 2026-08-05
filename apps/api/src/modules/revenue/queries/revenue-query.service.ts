import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { QueryReceivablesDto } from "../dto/query-receivables.dto";
import type { QueryRevenueSummaryDto } from "../dto/query-revenue-summary.dto";
import { RevenueRepository } from "../repositories/revenue.repository";

@Injectable()
export class RevenueQueryService {
  constructor(private readonly revenueRepository: RevenueRepository) {}

  async findReceivables(query: QueryReceivablesDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = this.buildReceivableWhere(query);
    const { items, total } = await this.revenueRepository.findManyPaginated({ where, skip, take: limit });

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findReceivable(id: string) {
    const receivable = await this.revenueRepository.findById(id);
    if (!receivable) throw new NotFoundException("Receivable not found");
    return receivable;
  }

  async findPayments(receivableId: string) {
    await this.ensureReceivableExists(receivableId);
    const items = await this.revenueRepository.findPayments(receivableId);
    return { items, meta: { page: 1, limit: items.length, total: items.length, totalPages: items.length > 0 ? 1 : 0 } };
  }

  async getSummary(query: QueryRevenueSummaryDto) {
    const where = this.buildSummaryWhere(query);
    const [summary, byStatus, byType] = await Promise.all([
      this.revenueRepository.aggregateSummary(where),
      this.revenueRepository.groupByStatus(where),
      this.revenueRepository.groupByType(where),
    ]);

    return {
      totalReceivables: summary._count,
      totalAmount: Number(summary._sum.amount ?? 0),
      paidAmount: Number(summary._sum.paidAmount ?? 0),
      outstandingAmount: Number(summary._sum.remainingAmount ?? 0),
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
        amount: Number(item._sum.amount ?? 0),
        paidAmount: Number(item._sum.paidAmount ?? 0),
        outstandingAmount: Number(item._sum.remainingAmount ?? 0),
      })),
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count,
        amount: Number(item._sum.amount ?? 0),
        paidAmount: Number(item._sum.paidAmount ?? 0),
        outstandingAmount: Number(item._sum.remainingAmount ?? 0),
      })),
    };
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
        ? { dueDate: { ...(query.from ? { gte: new Date(query.from) } : {}), ...(query.to ? { lte: new Date(query.to) } : {}) } }
        : {}),
    };

    if (query.search) {
      where.OR = [
        { receivableCode: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { note: { contains: query.search, mode: "insensitive" } },
        { customer: { fullName: { contains: query.search, mode: "insensitive" } } },
        { customer: { phoneNumber: { contains: query.search, mode: "insensitive" } } },
        { room: { code: { contains: query.search, mode: "insensitive" } } },
        { leaseContract: { contractCode: { contains: query.search, mode: "insensitive" } } },
        { payments: { some: { transactionCode: { contains: query.search, mode: "insensitive" } } } },
      ];
    }

    return where;
  }

  private buildSummaryWhere(query: QueryRevenueSummaryDto): Prisma.RevenueReceivableWhereInput {
    return {
      ...(query.apartmentId ? { apartmentId: query.apartmentId } : {}),
      ...(query.from || query.to
        ? { dueDate: { ...(query.from ? { gte: new Date(query.from) } : {}), ...(query.to ? { lte: new Date(query.to) } : {}) } }
        : {}),
    };
  }

  private async ensureReceivableExists(id: string): Promise<void> {
    const receivable = await this.revenueRepository.findById(id);
    if (!receivable) throw new NotFoundException("Receivable not found");
  }
}