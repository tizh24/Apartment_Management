-- CreateEnum
CREATE TYPE "SaleContractStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('UNPAID', 'PAID', 'CANCELED');

-- CreateTable
CREATE TABLE "SaleProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "bankAccountNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankCode" TEXT,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleContract" (
    "id" TEXT NOT NULL,
    "contractCode" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "apartmentId" TEXT,
    "roomId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "contractValue" DECIMAL(12,2) NOT NULL,
    "commissionAmount" DECIMAL(12,2) NOT NULL,
    "contractStatus" "SaleContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "commissionStatus" "CommissionStatus" NOT NULL DEFAULT 'UNPAID',
    "commissionPaidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleCommissionPayment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paymentQrUrl" TEXT,
    "paymentContent" TEXT NOT NULL,
    "confirmedById" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleCommissionPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleCommissionPaymentItem" (
    "paymentId" TEXT NOT NULL,
    "saleContractId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "SaleCommissionPaymentItem_pkey" PRIMARY KEY ("paymentId","saleContractId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SaleProfile_userId_key" ON "SaleProfile"("userId");

-- CreateIndex
CREATE INDEX "SaleProfile_fullName_idx" ON "SaleProfile"("fullName");

-- CreateIndex
CREATE INDEX "SaleProfile_phoneNumber_idx" ON "SaleProfile"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SaleContract_contractCode_key" ON "SaleContract"("contractCode");

-- CreateIndex
CREATE INDEX "SaleContract_saleId_idx" ON "SaleContract"("saleId");

-- CreateIndex
CREATE INDEX "SaleContract_apartmentId_idx" ON "SaleContract"("apartmentId");

-- CreateIndex
CREATE INDEX "SaleContract_roomId_idx" ON "SaleContract"("roomId");

-- CreateIndex
CREATE INDEX "SaleContract_startDate_idx" ON "SaleContract"("startDate");

-- CreateIndex
CREATE INDEX "SaleContract_contractStatus_idx" ON "SaleContract"("contractStatus");

-- CreateIndex
CREATE INDEX "SaleContract_commissionStatus_idx" ON "SaleContract"("commissionStatus");

-- CreateIndex
CREATE INDEX "SaleCommissionPayment_saleId_idx" ON "SaleCommissionPayment"("saleId");

-- CreateIndex
CREATE INDEX "SaleCommissionPayment_confirmedById_idx" ON "SaleCommissionPayment"("confirmedById");

-- CreateIndex
CREATE INDEX "SaleCommissionPayment_paidAt_idx" ON "SaleCommissionPayment"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "SaleCommissionPaymentItem_saleContractId_key" ON "SaleCommissionPaymentItem"("saleContractId");

-- AddForeignKey
ALTER TABLE "SaleProfile" ADD CONSTRAINT "SaleProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleContract" ADD CONSTRAINT "SaleContract_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "SaleProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleContract" ADD CONSTRAINT "SaleContract_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleContract" ADD CONSTRAINT "SaleContract_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleCommissionPayment" ADD CONSTRAINT "SaleCommissionPayment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "SaleProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleCommissionPayment" ADD CONSTRAINT "SaleCommissionPayment_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleCommissionPaymentItem" ADD CONSTRAINT "SaleCommissionPaymentItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "SaleCommissionPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleCommissionPaymentItem" ADD CONSTRAINT "SaleCommissionPaymentItem_saleContractId_fkey" FOREIGN KEY ("saleContractId") REFERENCES "SaleContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
