-- CreateTable
CREATE TABLE IF NOT EXISTS "Announcement" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "linkText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Announcement_isActive_idx" ON "Announcement"("isActive");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Announcement_priority_idx" ON "Announcement"("priority");

