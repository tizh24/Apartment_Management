import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import type { CreateCustomerDocumentDto } from "../dto/create-customer-document.dto";
import type { CreateCustomerDto } from "../dto/create-customer.dto";
import type { UpdateCustomerDto } from "../dto/update-customer.dto";
import { CustomersRepository } from "../repositories/customers.repository";

@Injectable()
export class CustomersCommandService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async create(dto: CreateCustomerDto) {
    await this.ensureApartmentExists(dto.apartmentId);
    await this.assertRoomBelongsToApartment(dto.currentRoomId, dto.apartmentId);

    return this.customersRepository.create({
      apartmentId: dto.apartmentId,
      currentRoomId: dto.currentRoomId,
      fullName: dto.fullName,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      nationality: dto.nationality,
      identityNumber: dto.identityNumber,
      passportNumber: dto.passportNumber,
      visaNumber: dto.visaNumber,
      status: dto.status,
      note: dto.note,
    });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.ensureCustomerExists(id);
    const nextApartmentId = dto.apartmentId ?? customer.apartmentId;

    if (dto.apartmentId) {
      await this.ensureApartmentExists(dto.apartmentId);
    }

    if (dto.currentRoomId) {
      await this.assertRoomBelongsToApartment(dto.currentRoomId, nextApartmentId);
    }

    return this.customersRepository.updateById(id, {
      apartmentId: dto.apartmentId,
      currentRoomId: dto.currentRoomId,
      fullName: dto.fullName,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      nationality: dto.nationality,
      identityNumber: dto.identityNumber,
      passportNumber: dto.passportNumber,
      visaNumber: dto.visaNumber,
      status: dto.status,
      note: dto.note,
    });
  }

  async createDocument(customerId: string, dto: CreateCustomerDocumentDto) {
    await this.ensureCustomerExists(customerId);

    return this.customersRepository.createDocument({
      customerId,
      type: dto.type,
      fileName: dto.fileName,
      fileUrl: dto.fileUrl,
      mimeType: dto.mimeType,
      size: dto.size,
      note: dto.note,
    });
  }

  private async ensureCustomerExists(id: string) {
    const customer = await this.customersRepository.findById(id);

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    return customer;
  }

  private async ensureApartmentExists(apartmentId: string): Promise<void> {
    const exists = await this.customersRepository.apartmentExists(apartmentId);

    if (!exists) {
      throw new NotFoundException("Apartment not found");
    }
  }

  private async assertRoomBelongsToApartment(
    roomId: string | undefined,
    apartmentId: string,
  ): Promise<void> {
    if (!roomId) {
      return;
    }

    const room = await this.customersRepository.findRoomApartment(roomId);

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    if (room.apartmentId !== apartmentId) {
      throw new BadRequestException("Room does not belong to apartment");
    }
  }
}
