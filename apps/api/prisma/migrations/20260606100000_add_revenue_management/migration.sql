CREATE TYPE "RevenueReceivableType" AS ENUM ('RENT', 'ELECTRICITY', 'WATER', 'SERVICE', 'DEPOSIT', 'OTHER');

CREATE TYPE "RevenueReceivableStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELED');

CREATE TYPE "RevenuePaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'QR_TRANSFER', 'OTHER');

CREATE TYPE "RevenueChangeAction" AS ENUM ('CREATED', 'UPDATED', 'PAYMENT_RECORDED', 'CANCELED');

CREATE TABLE "RevenueReceivable" (
    "id" TEXT NOT NULL,
    "receivableCode" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "leaseContractId" TEXT NOT NULL,
    "meterReadingId" TEXT,
    "type" "RevenueReceivableType" NOT NULL,
    "description" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remainingAmount" DECIMAL(12,2) NOT NULL,
    "status" "RevenueReceivableStatus" NOT NULL DEFAULT 'UNPAID',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueReceivable_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RevenuePayment" (
    "id" TEXT NOT NULL,
    "receivableId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "RevenuePaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionCode" TEXT,
    "evidenceUrl" TEXT,
    "evidenceNote" TEXT,
    "verifiedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenuePayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RevenueChangeLog" (
    "id" TEXT NOT NULL,
    "receivableId" TEXT NOT NULL,
    "changedById" TEXT,
    "action" "RevenueChangeAction" NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RevenueReceivable_receivableCode_key" ON "RevenueReceivable"("receivableCode");
CREATE INDEX "RevenueReceivable_apartmentId_idx" ON "RevenueReceivable"("apartmentId");
CREATE INDEX "RevenueReceivable_roomId_idx" ON "RevenueReceivable"("roomId");
CREATE INDEX "RevenueReceivable_customerId_idx" ON "RevenueReceivable"("customerId");
CREATE INDEX "RevenueReceivable_leaseContractId_idx" ON "RevenueReceivable"("leaseContractId");
CREATE INDEX "RevenueReceivable_meterReadingId_idx" ON "RevenueReceivable"("meterReadingId");
CREATE INDEX "RevenueReceivable_type_idx" ON "RevenueReceivable"("type");
CREATE INDEX "RevenueReceivable_status_idx" ON "RevenueReceivable"("status");
CREATE INDEX "RevenueReceivable_dueDate_idx" ON "RevenueReceivable"("dueDate");
CREATE INDEX "RevenueReceivable_periodStart_idx" ON "RevenueReceivable"("periodStart");
CREATE INDEX "RevenuePayment_receivableId_idx" ON "RevenuePayment"("receivableId");
CREATE INDEX "RevenuePayment_verifiedById_idx" ON "RevenuePayment"("verifiedById");
CREATE INDEX "RevenuePayment_paidAt_idx" ON "RevenuePayment"("paidAt");
CREATE INDEX "RevenuePayment_transactionCode_idx" ON "RevenuePayment"("transactionCode");
CREATE INDEX "RevenueChangeLog_receivableId_idx" ON "RevenueChangeLog"("receivableId");
CREATE INDEX "RevenueChangeLog_changedById_idx" ON "RevenueChangeLog"("changedById");
CREATE INDEX "RevenueChangeLog_action_idx" ON "RevenueChangeLog"("action");
CREATE INDEX "RevenueChangeLog_createdAt_idx" ON "RevenueChangeLog"("createdAt");

ALTER TABLE "RevenueReceivable"
ADD CONSTRAINT "RevenueReceivable_apartmentId_fkey"
FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RevenueReceivable"
ADD CONSTRAINT "RevenueReceivable_roomId_fkey"
FOREIGN KEY ("roomId") REFERENCES "Room"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RevenueReceivable"
ADD CONSTRAINT "RevenueReceivable_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RevenueReceivable"
ADD CONSTRAINT "RevenueReceivable_leaseContractId_fkey"
FOREIGN KEY ("leaseContractId") REFERENCES "LeaseContract"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RevenueReceivable"
ADD CONSTRAINT "RevenueReceivable_meterReadingId_fkey"
FOREIGN KEY ("meterReadingId") REFERENCES "MeterReading"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RevenuePayment"
ADD CONSTRAINT "RevenuePayment_receivableId_fkey"
FOREIGN KEY ("receivableId") REFERENCES "RevenueReceivable"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RevenuePayment"
ADD CONSTRAINT "RevenuePayment_verifiedById_fkey"
FOREIGN KEY ("verifiedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RevenueChangeLog"
ADD CONSTRAINT "RevenueChangeLog_receivableId_fkey"
FOREIGN KEY ("receivableId") REFERENCES "RevenueReceivable"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RevenueChangeLog"
ADD CONSTRAINT "RevenueChangeLog_changedById_fkey"
FOREIGN KEY ("changedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
