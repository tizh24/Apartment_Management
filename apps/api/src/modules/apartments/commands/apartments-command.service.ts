import { Injectable, NotFoundException } from "@nestjs/common";

import { toApartmentResponse } from "../apartment-response";
import type { CreateApartmentDto } from "../dto/create-apartment.dto";
import type { UpdateApartmentDto } from "../dto/update-apartment.dto";
import { ApartmentsRepository } from "../repositories/apartments.repository";

@Injectable()
export class ApartmentsCommandService {
  constructor(private readonly apartmentsRepository: ApartmentsRepository) {}

  async create(dto: CreateApartmentDto) {
    const shortId = await this.generateNextApartmentShortId();
    const apartment = await this.apartmentsRepository.create({
      shortId,
      name: dto.name,
      address: dto.address,
      timezone: dto.timezone,
      note: dto.note,
    });

    return toApartmentResponse(apartment);
  }

  async update(shortId: string, dto: UpdateApartmentDto) {
    await this.ensureApartmentExistsByShortId(shortId);
    const apartment = await this.apartmentsRepository.updateByShortId(shortId, {
      name: dto.name,
      address: dto.address,
      timezone: dto.timezone,
      note: dto.note,
    });

    return toApartmentResponse(apartment);
  }

  private async ensureApartmentExistsByShortId(shortId: string): Promise<void> {
    const exists = await this.apartmentsRepository.existsByShortId(shortId);

    if (!exists) {
      throw new NotFoundException("Apartment not found");
    }
  }

  private async generateNextApartmentShortId(): Promise<string> {
    const apartments = await this.apartmentsRepository.findExistingShortIds();
    const maxNumber = apartments.reduce((max, apartment) => {
      const value = Number(apartment.shortId);

      return Number.isFinite(value) && value > max ? value : max;
    }, 0);

    return String(maxNumber + 1).padStart(2, "0");
  }
}
