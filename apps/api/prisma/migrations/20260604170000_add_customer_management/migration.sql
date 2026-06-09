-- Customer profile status for the customer management module.
CREATE TYPE "CustomerStatus" AS ENUM ('RENTING', 'ENDED', 'CANCELED');

-- Document types stored as metadata; actual file storage can be local/S3/R2 later.
CREATE TYPE "CustomerDocumentType" AS ENUM ('PASSPORT', 'ID_CARD', 'VISA', 'OTHER');

CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "currentRoomId" TEXT,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "nationality" TEXT,
    "identityNumber" TEXT,
    "passportNumber" TEXT,
    "visaNumber" TEXT,
    "status" "CustomerStatus" NOT NULL DEFAULT 'ENDED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerDocument" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "CustomerDocumentType" NOT NULL,
    "fileName" TEXT,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Customer_apartmentId_idx" ON "Customer"("apartmentId");
CREATE INDEX "Customer_currentRoomId_idx" ON "Customer"("currentRoomId");
CREATE INDEX "Customer_fullName_idx" ON "Customer"("fullName");
CREATE INDEX "Customer_phoneNumber_idx" ON "Customer"("phoneNumber");
CREATE INDEX "Customer_identityNumber_idx" ON "Customer"("identityNumber");
CREATE INDEX "Customer_passportNumber_idx" ON "Customer"("passportNumber");
CREATE INDEX "Customer_status_idx" ON "Customer"("status");
CREATE INDEX "CustomerDocument_customerId_idx" ON "CustomerDocument"("customerId");
CREATE INDEX "CustomerDocument_type_idx" ON "CustomerDocument"("type");

ALTER TABLE "Customer"
ADD CONSTRAINT "Customer_apartmentId_fkey"
FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Customer"
ADD CONSTRAINT "Customer_currentRoomId_fkey"
FOREIGN KEY ("currentRoomId") REFERENCES "Room"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CustomerDocument"
ADD CONSTRAINT "CustomerDocument_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
