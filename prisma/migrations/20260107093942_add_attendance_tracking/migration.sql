-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attendee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dietaryRestrictions" TEXT,
    "accessibilityNeeds" TEXT,
    "emergencyContact" TEXT,
    "ageRange" TEXT,
    "howHeardAbout" TEXT,
    "questions" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "attendedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Attendee" ("accessibilityNeeds", "ageRange", "createdAt", "dietaryRestrictions", "email", "emergencyContact", "eventId", "howHeardAbout", "id", "name", "phone", "questions") SELECT "accessibilityNeeds", "ageRange", "createdAt", "dietaryRestrictions", "email", "emergencyContact", "eventId", "howHeardAbout", "id", "name", "phone", "questions" FROM "Attendee";
DROP TABLE "Attendee";
ALTER TABLE "new_Attendee" RENAME TO "Attendee";
CREATE INDEX "Attendee_eventId_idx" ON "Attendee"("eventId");
CREATE INDEX "Attendee_email_idx" ON "Attendee"("email");
CREATE INDEX "Attendee_attended_idx" ON "Attendee"("attended");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
