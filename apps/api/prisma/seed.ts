import { PrismaClient, RoomStatus, UserRole } from "@prisma/client";
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

  await prisma.user.upsert({
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

  await prisma.user.upsert({
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

  await prisma.room.upsert({
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
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
