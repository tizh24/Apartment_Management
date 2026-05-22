-- Add apartment public identity and profile fields.
ALTER TABLE "Apartment"
ADD COLUMN "shortId" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "note" TEXT;

-- Backfill a short id for existing rows before removing code.
WITH numbered_apartments AS (
  SELECT "id", LPAD(ROW_NUMBER() OVER (ORDER BY "createdAt", "id")::TEXT, 2, '0') AS "nextShortId"
  FROM "Apartment"
)
UPDATE "Apartment"
SET "shortId" = numbered_apartments."nextShortId"
FROM numbered_apartments
WHERE "Apartment"."id" = numbered_apartments."id";

CREATE UNIQUE INDEX "Apartment_shortId_key" ON "Apartment"("shortId");

DROP INDEX IF EXISTS "Apartment_code_key";
ALTER TABLE "Apartment" DROP COLUMN "code";
