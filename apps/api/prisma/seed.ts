import { PrismaClient, RoomStatus, UserRole } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminPasswordHash = await argon2.hash("Admin@123456");

  const apartment = await prisma.apartment.upsert({
    where: { code: "APT-001" },
    update: {},
    create: {
      code: "APT-001",
      name: "Sample Apartment",
    },
  });

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      email: "admin@example.com",
      fullName: "Admin User",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
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
