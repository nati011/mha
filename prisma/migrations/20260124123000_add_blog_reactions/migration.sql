-- Add reaction counters to BlogPost if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'BlogPost'
          AND column_name = 'clapCount'
    ) THEN
        ALTER TABLE "BlogPost" ADD COLUMN "clapCount" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;


