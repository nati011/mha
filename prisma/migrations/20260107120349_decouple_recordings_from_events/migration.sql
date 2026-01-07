-- RenameTable
ALTER TABLE "Video" RENAME TO "Recording";

-- AlterTable
ALTER TABLE "Recording" ADD COLUMN "description" TEXT;
ALTER TABLE "Recording" ADD COLUMN "thumbnail" TEXT;
ALTER TABLE "Recording" ADD COLUMN "duration" TEXT;

-- Make eventId nullable and update foreign key
-- First, drop the old foreign key constraint
-- Note: SQLite doesn't support dropping foreign keys directly, so we'll recreate the table
CREATE TABLE "Recording_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "duration" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recording_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data from old table
INSERT INTO "Recording_new" ("id", "eventId", "title", "url", "createdAt", "updatedAt")
SELECT "id", "eventId", COALESCE("title", 'Untitled Recording'), "url", "createdAt", "updatedAt"
FROM "Recording";

-- Drop old table
DROP TABLE "Recording";

-- Rename new table
ALTER TABLE "Recording_new" RENAME TO "Recording";

-- CreateIndex
CREATE INDEX "Recording_eventId_idx" ON "Recording"("eventId");
