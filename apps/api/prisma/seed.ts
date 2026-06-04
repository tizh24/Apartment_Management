import {
  CommissionStatus,
  PrismaClient,
  RoomStatus,
  SaleContractStatus,
  UserRole,
} from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminPasswordHash = await argon2.hash("Admin@123456");
  const staffPasswordHash = await argon2.hash("Staff@123456");
  const salePasswordHash = await argon2.hash("Sale@123456");

  const apartment = await prisma.apartment.upsert({
    where: { shortId: "01" },
    update: {
      name: "Sample Apartment",
      address: "12 Nguyen Trai, District 1, Ho Chi Minh City",
      note: "Seed apartment for backend testing.",
    },
    create: {
      shortId: "01",
      name: "Sample Apartment",
      address: "12 Nguyen Trai, District 1, Ho Chi Minh City",
      note: "Seed apartment for backend testing.",
    },
  });

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      email: "admin@example.com",
      fullName: "Admin User",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      apartmentId: null,
      isActive: true,
    },
    create: {
      username: "admin",
      email: "admin@example.com",
      fullName: "Admin User",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { username: "staff" },
    update: {
      email: "staff@example.com",
      fullName: "Staff User",
      passwordHash: staffPasswordHash,
      role: UserRole.STAFF,
      apartmentId: apartment.id,
      isActive: true,
    },
    create: {
      username: "staff",
      email: "staff@example.com",
      fullName: "Staff User",
      passwordHash: staffPasswordHash,
      role: UserRole.STAFF,
      apartmentId: apartment.id,
    },
  });

  const saleUser = await prisma.user.upsert({
    where: { username: "sale" },
    update: {
      email: "sale@example.com",
      fullName: "Sale User",
      passwordHash: salePasswordHash,
      role: UserRole.SALE,
      apartmentId: null,
      isActive: true,
    },
    create: {
      username: "sale",
      email: "sale@example.com",
      fullName: "Sale User",
      passwordHash: salePasswordHash,
      role: UserRole.SALE,
    },
  });

  const rooms = [
    {
      shortId: "001",
      code: "101",
      floor: "1",
      area: 32.5,
      monthlyRent: 10000,
      status: RoomStatus.VACANT,
      description: "Studio room near the lobby.",
      amenities: ["wifi", "air_conditioner", "washing_machine"],
      note: "Ready for viewing.",
    },
    {
      shortId: "002",
      code: "102",
      floor: "1",
      area: 35,
      monthlyRent: 12000,
      status: RoomStatus.MAINTENANCE,
      description: "One-bedroom room under minor repair.",
      amenities: ["wifi", "air_conditioner"],
      note: "Replace bathroom faucet before renting.",
    },
    {
      shortId: "003",
      code: "201",
      floor: "2",
      area: 38,
      monthlyRent: 14500,
      status: RoomStatus.RESERVED,
      description: "Bright corner room with balcony.",
      amenities: ["wifi", "balcony", "kitchen"],
      note: "Reserved for a new customer.",
    },
    {
      shortId: "004",
      code: "202",
      floor: "2",
      area: 30,
      monthlyRent: 9500,
      status: RoomStatus.OCCUPIED,
      description: "Compact furnished room.",
      amenities: ["wifi", "furnished"],
      note: "Occupied sample room.",
    },
    {
      shortId: "005",
      code: "301",
      floor: "3",
      area: 42,
      monthlyRent: 16000,
      status: RoomStatus.CHECKOUT_SOON,
      description: "Large top-floor room.",
      amenities: ["wifi", "balcony", "kitchen", "furnished"],
      note: "Checkout soon sample room.",
    },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: {
        apartmentId_code: {
          apartmentId: apartment.id,
          code: room.code,
        },
      },
      update: {
        floor: room.floor,
        shortId: room.shortId,
        area: room.area,
        monthlyRent: room.monthlyRent,
        status: room.status,
        description: room.description,
        amenities: room.amenities,
        note: room.note,
      },
      create: {
        apartmentId: apartment.id,
        ...room,
      },
    });
  }

  await backfillApartmentShortIds();
  await backfillRoomShortIds();

  const room101 = await prisma.room.findUniqueOrThrow({
    where: {
      apartmentId_code: {
        apartmentId: apartment.id,
        code: "101",
      },
    },
  });

  await prisma.meterReading.upsert({
    where: {
      roomId_periodStart_periodEnd: {
        roomId: room101.id,
        periodStart: new Date("2026-05-01"),
        periodEnd: new Date("2026-05-31"),
      },
    },
    update: {},
    create: {
      roomId: room101.id,
      periodStart: new Date("2026-05-01"),
      periodEnd: new Date("2026-05-31"),
      electricityStart: 100,
      electricityEnd: 180,
      electricityUsage: 80,
      electricityUnitPrice: 3500,
      waterStart: 20,
      waterEnd: 35,
      waterUsage: 15,
      waterUnitPrice: 15000,
      totalAmount: 505000,
      recordedById: admin.id,
      note: "Sample meter reading for May 2026.",
    },
  });

  const saleProfile = await prisma.saleProfile.upsert({
    where: { userId: saleUser.id },
    update: {
      fullName: "Sale User",
      phoneNumber: "0901234567",
      bankAccountNumber: "1234567890",
      bankName: "Vietcombank",
      bankCode: "VCB",
      note: "Seed sale profile for commission testing.",
      isActive: true,
    },
    create: {
      userId: saleUser.id,
      fullName: "Sale User",
      phoneNumber: "0901234567",
      bankAccountNumber: "1234567890",
      bankName: "Vietcombank",
      bankCode: "VCB",
      note: "Seed sale profile for commission testing.",
    },
  });

  await prisma.saleContract.upsert({
    where: { contractCode: "SALE-CON-001" },
    update: {
      saleId: saleProfile.id,
      apartmentId: apartment.id,
      roomId: room101.id,
      customerName: "Sample Customer One",
      customerPhone: "0900000001",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-06-01"),
      contractValue: 12000000,
      commissionAmount: 1200000,
      contractStatus: SaleContractStatus.ACTIVE,
      commissionStatus: CommissionStatus.UNPAID,
      note: "Seed unpaid commission contract.",
    },
    create: {
      contractCode: "SALE-CON-001",
      saleId: saleProfile.id,
      apartmentId: apartment.id,
      roomId: room101.id,
      customerName: "Sample Customer One",
      customerPhone: "0900000001",
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-06-01"),
      contractValue: 12000000,
      commissionAmount: 1200000,
      contractStatus: SaleContractStatus.ACTIVE,
      commissionStatus: CommissionStatus.UNPAID,
      note: "Seed unpaid commission contract.",
    },
  });

  const paidSaleContract = await prisma.saleContract.upsert({
    where: { contractCode: "SALE-CON-000" },
    update: {
      saleId: saleProfile.id,
      apartmentId: apartment.id,
      roomId: room101.id,
      customerName: "Sample Customer Paid",
      customerPhone: "0900000000",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2027-05-01"),
      contractValue: 8000000,
      commissionAmount: 800000,
      contractStatus: SaleContractStatus.COMPLETED,
      commissionStatus: CommissionStatus.PAID,
      commissionPaidAt: new Date("2026-05-22"),
      note: "Seed paid commission contract.",
    },
    create: {
      contractCode: "SALE-CON-000",
      saleId: saleProfile.id,
      apartmentId: apartment.id,
      roomId: room101.id,
      customerName: "Sample Customer Paid",
      customerPhone: "0900000000",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2027-05-01"),
      contractValue: 8000000,
      commissionAmount: 800000,
      contractStatus: SaleContractStatus.COMPLETED,
      commissionStatus: CommissionStatus.PAID,
      commissionPaidAt: new Date("2026-05-22"),
      note: "Seed paid commission contract.",
    },
  });

  await prisma.saleCommissionPayment.upsert({
    where: { id: "seed-sale-payment-001" },
    update: {},
    create: {
      id: "seed-sale-payment-001",
      saleId: saleProfile.id,
      totalAmount: 800000,
      paymentContent: "PAY SALE Sale User SALE-CON-000",
      paymentQrUrl:
        "https://img.vietqr.io/image/VCB-1234567890-compact2.png?amount=800000&addInfo=PAY%20SALE%20Sale%20User%20SALE-CON-000",
      confirmedById: admin.id,
      paidAt: new Date("2026-05-22"),
      note: "Seed paid commission payment.",
      items: {
        create: {
          saleContractId: paidSaleContract.id,
          amount: 800000,
        },
      },
    },
  });
}

async function backfillApartmentShortIds(): Promise<void> {
  const existingApartments = await prisma.apartment.findMany({
    where: { shortId: { not: null } },
    select: { shortId: true },
  });
  let currentMax = existingApartments.reduce((max, apartment) => {
    const value = Number(apartment.shortId);

    return Number.isFinite(value) && value > max ? value : max;
  }, 0);
  const apartmentsWithoutShortId = await prisma.apartment.findMany({
    where: { shortId: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  for (const apartment of apartmentsWithoutShortId) {
    currentMax += 1;
    await prisma.apartment.update({
      where: { id: apartment.id },
      data: { shortId: String(currentMax).padStart(2, "0") },
    });
  }
}

async function backfillRoomShortIds(): Promise<void> {
  const existingRooms = await prisma.room.findMany({
    where: { shortId: { not: null } },
    select: { shortId: true },
  });
  let currentMax = existingRooms.reduce((max, room) => {
    const value = Number(room.shortId);

    return Number.isFinite(value) && value > max ? value : max;
  }, 0);
  const roomsWithoutShortId = await prisma.room.findMany({
    where: { shortId: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  for (const room of roomsWithoutShortId) {
    currentMax += 1;
    await prisma.room.update({
      where: { id: room.id },
      data: { shortId: String(currentMax).padStart(3, "0") },
    });
  }
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
