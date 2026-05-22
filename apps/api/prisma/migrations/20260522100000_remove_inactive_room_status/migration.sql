-- VERSION 2 removes the "Ngung su dung" room status.
-- Existing inactive rooms are kept usable by moving them to MAINTENANCE first.
UPDATE "Room" SET "status" = 'MAINTENANCE' WHERE "status"::text = 'INACTIVE';

ALTER TABLE "Room" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "RoomStatus_new" AS ENUM (
  'VACANT',
  'OCCUPIED',
  'RESERVED',
  'CHECKOUT_SOON',
  'MAINTENANCE'
);

ALTER TABLE "Room"
  ALTER COLUMN "status" TYPE "RoomStatus_new"
  USING ("status"::text::"RoomStatus_new");

DROP TYPE "RoomStatus";
ALTER TYPE "RoomStatus_new" RENAME TO "RoomStatus";

ALTER TABLE "Room" ALTER COLUMN "status" SET DEFAULT 'VACANT';
