-- Expand room details for operations and listing data.
ALTER TABLE "Room"
ADD COLUMN "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "area" DECIMAL(10,2),
ADD COLUMN "description" TEXT,
ADD COLUMN "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "note" TEXT,
ADD COLUMN "shortId" TEXT;

-- Utility readings are stored per room and billing period.
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

CREATE INDEX "MeterReading_roomId_periodStart_idx" ON "MeterReading"("roomId", "periodStart");
CREATE UNIQUE INDEX "MeterReading_roomId_periodStart_periodEnd_key" ON "MeterReading"("roomId", "periodStart", "periodEnd");
CREATE UNIQUE INDEX "Room_shortId_key" ON "Room"("shortId");

ALTER TABLE "MeterReading"
ADD CONSTRAINT "MeterReading_roomId_fkey"
FOREIGN KEY ("roomId") REFERENCES "Room"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MeterReading"
ADD CONSTRAINT "MeterReading_recordedById_fkey"
FOREIGN KEY ("recordedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
