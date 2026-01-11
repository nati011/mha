-- CreateTable: Create Chapter table only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Chapter') THEN
        CREATE TABLE "Chapter" (
            "id" SERIAL NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "location" TEXT,
            "address" TEXT,
            "contactEmail" TEXT,
            "contactPhone" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- CreateIndex: Add indexes only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Chapter_isActive_idx') THEN
        CREATE INDEX "Chapter_isActive_idx" ON "Chapter"("isActive");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Chapter_name_idx') THEN
        CREATE INDEX "Chapter_name_idx" ON "Chapter"("name");
    END IF;
END $$;

-- AlterTable: Add chapterId column to Event if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Event' AND column_name = 'chapterId'
    ) THEN
        ALTER TABLE "Event" ADD COLUMN "chapterId" INTEGER;
    END IF;
END $$;

-- CreateIndex: Add chapterId index if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Event_chapterId_idx') THEN
        CREATE INDEX "Event_chapterId_idx" ON "Event"("chapterId");
    END IF;
END $$;

-- AddForeignKey: Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Event_chapterId_fkey' 
        AND table_name = 'Event'
    ) THEN
        ALTER TABLE "Event" ADD CONSTRAINT "Event_chapterId_fkey" 
        FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
