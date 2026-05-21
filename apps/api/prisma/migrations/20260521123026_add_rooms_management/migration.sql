-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RoomStatus" ADD VALUE 'RESERVED';
ALTER TYPE "RoomStatus" ADD VALUE 'CHECKOUT_SOON';
ALTER TYPE "RoomStatus" ADD VALUE 'INACTIVE';

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "area" DECIMAL(10,2),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "note" TEXT;

-- CreateTable
CREATE TABLE "MeterReading" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "electricityStart" DECIMAL(10,2) NOT NULL,
    "electricityEnd" DECIMAL(10,2) NOT NULL,
    "electricityUsage" DECIMAL(10,2) NOT NULL,
    "electricityUnitPrice" DECIMAL(10,2) NOT NULL,
    "waterStart" DECIMAL(10,2) NOT NULL,
    "waterEnd" DECIMAL(10,2) NOT NULL,
    "waterUsage" DECIMAL(10,2) NOT NULL,
    "waterUnitPrice" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "recordedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeterReading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeterReading_roomId_periodStart_idx" ON "MeterReading"("roomId", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "MeterReading_roomId_periodStart_periodEnd_key" ON "MeterReading"("roomId", "periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeterReading" ADD CONSTRAINT "MeterReading_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
