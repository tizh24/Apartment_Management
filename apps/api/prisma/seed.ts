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

  const room = await prisma.room.upsert({
    where: {
      apartmentId_code: {
        apartmentId: apartment.id,
        code: "101",
      },
    },
    update: {},
    create: {
      apartmentId: apartment.id,
      code: "101",
      monthlyRent: 10000,
      status: RoomStatus.VACANT,
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
      roomId: room.id,
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
      roomId: room.id,
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
      roomId: room.id,
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
      roomId: room.id,
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

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
