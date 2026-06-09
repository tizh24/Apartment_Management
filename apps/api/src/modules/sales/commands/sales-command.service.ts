import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommissionStatus, UserRole } from "@prisma/client";

import type { AuthenticatedRequestUser } from "../../auth/auth.types";
import type { CommissionPaymentDto, CreateCommissionPaymentDto } from "../dto/commission-payment.dto";
import type { CreateSaleProfileDto } from "../dto/create-sale-profile.dto";
import type { UpdateSaleProfileDto } from "../dto/update-sale-profile.dto";
import { SalesRepository } from "../repositories/sales.repository";

@Injectable()
export class SalesCommandService {
  constructor(private readonly salesRepository: SalesRepository) {}

  async createProfile(dto: CreateSaleProfileDto) {
    if (dto.userId) {
      await this.assertSaleUser(dto.userId);
    }

    return this.salesRepository.createProfile(dto);
  }

  async updateProfile(id: string, dto: UpdateSaleProfileDto) {
    await this.ensureSaleProfileExists(id);

    if (dto.userId) {
      await this.assertSaleUser(dto.userId);
    }

    return this.salesRepository.updateProfile(id, dto);
  }

  async createCommissionPayment(
    dto: CreateCommissionPaymentDto,
    confirmedBy: AuthenticatedRequestUser,
  ) {
    const preview = await this.getCommissionPreview(dto);
    const paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();

    return this.salesRepository.transaction(async (transaction) => {
      const payment = await this.salesRepository.createCommissionPayment(transaction, {
        saleId: dto.saleId,
        totalAmount: preview.totalAmount,
        paymentContent: preview.paymentContent,
        paymentQrUrl: preview.paymentQrUrl,
        confirmedById: confirmedBy.id,
        paidAt,
        note: dto.note,
        items: {
          create: preview.contracts.map((contract) => ({
            saleContractId: contract.id,
            amount: contract.commissionAmount,
          })),
        },
      });

      await this.salesRepository.markContractsPaid(transaction, dto.contractIds, paidAt);

      return payment;
    });
  }

  private async getCommissionPreview(dto: CommissionPaymentDto) {
    const sale = await this.ensureSaleProfileExists(dto.saleId);
    const contracts = await this.getPayableContracts(dto.saleId, dto.contractIds);
    const totalAmount = contracts.reduce(
      (total, contract) => total + Number(contract.commissionAmount),
      0,
    );
    const paymentContent = this.buildPaymentContent(sale.fullName, contracts);

    return {
      sale,
      contracts,
      totalAmount,
      paymentContent,
      paymentQrUrl: this.buildPaymentQrUrl(sale, totalAmount, paymentContent),
    };
  }

  private async assertSaleUser(userId: string): Promise<void> {
    const user = await this.salesRepository.findUserRole(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.role !== UserRole.SALE) {
      throw new BadRequestException("Sale profile can only be linked to SALE users");
    }
  }

  private async ensureSaleProfileExists(id: string) {
    const sale = await this.salesRepository.findProfileById(id);

    if (!sale) {
      throw new NotFoundException("Sale profile not found");
    }

    return sale;
  }

  private async getPayableContracts(saleId: string, contractIds: string[]) {
    const uniqueIds = [...new Set(contractIds)];

    if (uniqueIds.length !== contractIds.length) {
      throw new BadRequestException("Duplicate contract ids are not allowed");
    }

    const contracts = await this.salesRepository.findPayableContracts(saleId, uniqueIds);

    if (contracts.length !== uniqueIds.length) {
      throw new BadRequestException("Some contracts do not belong to this sale");
    }

    const invalidContract = contracts.find(
      (contract) => contract.commissionStatus !== CommissionStatus.UNPAID,
    );

    if (invalidContract) {
      throw new BadRequestException(
        `Contract ${invalidContract.contractCode} is not payable`,
      );
    }

    return contracts;
  }

  private buildPaymentContent(
    saleName: string,
    contracts: Array<{ contractCode: string }>,
  ): string {
    const contractCodes = contracts.map((contract) => contract.contractCode).join("-");

    return `PAY SALE ${saleName} ${contractCodes}`.slice(0, 140);
  }

  private buildPaymentQrUrl(
    sale: { bankCode: string | null; bankAccountNumber: string },
    amount: number,
    content: string,
  ): string | null {
    if (!sale.bankCode) {
      return null;
    }

    const encodedContent = encodeURIComponent(content);

    return `https://img.vietqr.io/image/${sale.bankCode}-${sale.bankAccountNumber}-compact2.png?amount=${amount}&addInfo=${encodedContent}`;
  }
}
