import { PrismaClient, RoomStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const apartment = await prisma.apartment.upsert({
    where: { code: "APT-001" },
    update: {},
    create: {
      code: "APT-001",
      name: "Sample Apartment",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      fullName: "Admin User",
      passwordHash: "change-me",
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
