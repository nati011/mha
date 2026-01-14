-- AlterTable
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "openingNotes" TEXT,
ADD COLUMN IF NOT EXISTS "closingNotes" TEXT;

