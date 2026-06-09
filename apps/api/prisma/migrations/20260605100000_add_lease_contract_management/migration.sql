CREATE TYPE "LeaseContractStatus" AS ENUM ('RESERVED', 'ACTIVE', 'ENDED', 'CANCELED');

CREATE TYPE "LeaseContractChangeAction" AS ENUM (
  'CREATED',
  'UPDATED',
  'EXTENDED',
  'ENDED_EARLY',
  'CANCELED',
  'FILE_ADDED'
);

CREATE TABLE "LeaseContract" (
    "id" TEXT NOT NULL,
    "contractCode" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "saleProfileId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rentDurationMonths" INTEGER,
    "monthlyRent" DECIMAL(12,2) NOT NULL,
    "depositAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "terms" TEXT,
    "commissionAmount" DECIMAL(12,2),
    "status" "LeaseContractStatus" NOT NULL DEFAULT 'RESERVED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaseContract_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaseContractFile" (
    "id" TEXT NOT NULL,
    "leaseContractId" TEXT NOT NULL,
    "fileName" TEXT,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaseContractFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaseContractChangeLog" (
    "id" TEXT NOT NULL,
    "leaseContractId" TEXT NOT NULL,
    "changedById" TEXT,
    "action" "LeaseContractChangeAction" NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaseContractChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LeaseContract_contractCode_key" ON "LeaseContract"("contractCode");
CREATE INDEX "LeaseContract_apartmentId_idx" ON "LeaseContract"("apartmentId");
CREATE INDEX "LeaseContract_roomId_idx" ON "LeaseContract"("roomId");
CREATE INDEX "LeaseContract_customerId_idx" ON "LeaseContract"("customerId");
CREATE INDEX "LeaseContract_saleProfileId_idx" ON "LeaseContract"("saleProfileId");
CREATE INDEX "LeaseContract_startDate_idx" ON "LeaseContract"("startDate");
CREATE INDEX "LeaseContract_endDate_idx" ON "LeaseContract"("endDate");
CREATE INDEX "LeaseContract_status_idx" ON "LeaseContract"("status");
CREATE INDEX "LeaseContractFile_leaseContractId_idx" ON "LeaseContractFile"("leaseContractId");
CREATE INDEX "LeaseContractChangeLog_leaseContractId_idx" ON "LeaseContractChangeLog"("leaseContractId");
CREATE INDEX "LeaseContractChangeLog_changedById_idx" ON "LeaseContractChangeLog"("changedById");
CREATE INDEX "LeaseContractChangeLog_action_idx" ON "LeaseContractChangeLog"("action");
CREATE INDEX "LeaseContractChangeLog_createdAt_idx" ON "LeaseContractChangeLog"("createdAt");

ALTER TABLE "LeaseContract"
ADD CONSTRAINT "LeaseContract_apartmentId_fkey"
FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LeaseContract"
ADD CONSTRAINT "LeaseContract_roomId_fkey"
FOREIGN KEY ("roomId") REFERENCES "Room"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LeaseContract"
ADD CONSTRAINT "LeaseContract_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LeaseContract"
ADD CONSTRAINT "LeaseContract_saleProfileId_fkey"
FOREIGN KEY ("saleProfileId") REFERENCES "SaleProfile"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LeaseContractFile"
ADD CONSTRAINT "LeaseContractFile_leaseContractId_fkey"
FOREIGN KEY ("leaseContractId") REFERENCES "LeaseContract"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeaseContractChangeLog"
ADD CONSTRAINT "LeaseContractChangeLog_leaseContractId_fkey"
FOREIGN KEY ("leaseContractId") REFERENCES "LeaseContract"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeaseContractChangeLog"
ADD CONSTRAINT "LeaseContractChangeLog_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
