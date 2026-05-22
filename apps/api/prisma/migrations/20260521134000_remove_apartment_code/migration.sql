-- DropIndex
DROP INDEX IF EXISTS "Apartment_code_key";

-- AlterTable
ALTER TABLE "Apartment" DROP COLUMN IF EXISTS "code";
