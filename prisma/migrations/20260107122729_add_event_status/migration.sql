-- AlterTable
ALTER TABLE "Event" ADD COLUMN "status" TEXT;

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");
