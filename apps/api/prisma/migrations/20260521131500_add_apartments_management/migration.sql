-- AlterTable
ALTER TABLE "Apartment"
ADD COLUMN "shortId" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "note" TEXT;

-- AlterTable
ALTER TABLE "Room"
ADD COLUMN "shortId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Apartment_shortId_key" ON "Apartment"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_shortId_key" ON "Room"("shortId");
