import { Injectable, NotFoundException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";

import { toApartmentResponse } from "../apartment-response";
import type { QueryApartmentsDto } from "../dto/query-apartments.dto";
import { ApartmentsRepository } from "../repositories/apartments.repository";

@Injectable()
export class ApartmentsQueryService {
  constructor(private readonly apartmentsRepository: ApartmentsRepository) {}

  async findAll(query: QueryApartmentsDto) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;
    const where = this.buildApartmentWhere(query);
    const { items, total } = await this.apartmentsRepository.findManyPaginated({
      where,
      skip,
      take: limit,
    });

    return {
      items: items.map((apartment) => toApartmentResponse(apartment)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(shortId: string) {
    const apartment = await this.apartmentsRepository.findByShortId(shortId);

    if (!apartment) {
      throw new NotFoundException("Apartment not found");
    }

    return toApartmentResponse(apartment);
  }

  private buildApartmentWhere(
    query: QueryApartmentsDto,
  ): Prisma.ApartmentWhereInput {
    if (!query.search) {
      return {};
    }

    return {
      OR: [
        { shortId: { contains: query.search, mode: "insensitive" } },
        { name: { contains: query.search, mode: "insensitive" } },
        { address: { contains: query.search, mode: "insensitive" } },
      ],
    };
  }
}
