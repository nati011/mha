-- AlterTable
-- SQLite doesn't support dropping columns directly, so we need to recreate the table
CREATE TABLE "Attendee_new" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "occupation" TEXT,
    "emergencyContact" TEXT,
    "ageRange" TEXT,
    "howHeardAbout" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "attendedAt" DATETIME,
    "signature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Copy data from old table (excluding removed fields)
INSERT INTO "Attendee_new" ("id", "eventId", "name", "email", "phone", "emergencyContact", "ageRange", "howHeardAbout", "attended", "attendedAt", "signature", "createdAt")
SELECT "id", "eventId", "name", "email", "phone", "emergencyContact", "ageRange", "howHeardAbout", "attended", "attendedAt", "signature", "createdAt"
FROM "Attendee";

-- Drop old table
DROP TABLE "Attendee";

-- Rename new table
ALTER TABLE "Attendee_new" RENAME TO "Attendee";

-- CreateIndex
CREATE INDEX "Attendee_eventId_idx" ON "Attendee"("eventId");
CREATE INDEX "Attendee_email_idx" ON "Attendee"("email");
CREATE INDEX "Attendee_attended_idx" ON "Attendee"("attended");
