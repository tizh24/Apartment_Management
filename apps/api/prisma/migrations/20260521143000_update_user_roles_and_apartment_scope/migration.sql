-- Normalize any existing accountant users before recreating the enum.
UPDATE "User" SET "role" = 'STAFF' WHERE "role"::text = 'ACCOUNTANT';

-- Drop the default before changing enum type.
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

-- Recreate enum without ACCOUNTANT.
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'STAFF', 'SALE');
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "UserRole_new"
  USING ("role"::text::"UserRole_new");
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

-- Restore default.
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'STAFF';

-- Add apartment scope for staff users.
ALTER TABLE "User" ADD COLUMN "apartmentId" TEXT;

CREATE INDEX "User_apartmentId_idx" ON "User"("apartmentId");

ALTER TABLE "User"
ADD CONSTRAINT "User_apartmentId_fkey"
FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
