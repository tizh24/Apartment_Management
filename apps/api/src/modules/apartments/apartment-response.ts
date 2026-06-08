import type { Prisma } from "@prisma/client";

export type ApartmentWithRoomCount = Prisma.ApartmentGetPayload<{
  include: {
    _count: {
      select: {
        rooms: true;
      };
    };
  };
}>;

export type ApartmentResponse = Omit<ApartmentWithRoomCount, "_count"> & {
  roomCount: number;
};

export function toApartmentResponse(
  apartment: ApartmentWithRoomCount,
): ApartmentResponse {
  const { _count, ...data } = apartment;

  return {
    ...data,
    roomCount: _count.rooms,
  };
}
