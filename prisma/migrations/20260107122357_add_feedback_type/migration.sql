-- AlterTable
-- SQLite doesn't support dropping columns directly, so we need to recreate the table
CREATE TABLE "EventFeedback_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "attendeeId" INTEGER,
    "name" TEXT,
    "email" TEXT,
    "rating" INTEGER,
    "feedback" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'comment',
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventFeedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data from old table
INSERT INTO "EventFeedback_new" ("id", "eventId", "attendeeId", "name", "email", "rating", "feedback", "anonymous", "createdAt")
SELECT "id", "eventId", "attendeeId", "name", "email", "rating", "feedback", "anonymous", "createdAt"
FROM "EventFeedback";

-- Drop old table
DROP TABLE "EventFeedback";

-- Rename new table
ALTER TABLE "EventFeedback_new" RENAME TO "EventFeedback";

-- CreateIndex
CREATE INDEX "EventFeedback_eventId_idx" ON "EventFeedback"("eventId");
CREATE INDEX "EventFeedback_type_idx" ON "EventFeedback"("type");
CREATE INDEX "EventFeedback_rating_idx" ON "EventFeedback"("rating");
