-- Add contactPreference column to BlogPost if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'BlogPost'
          AND column_name = 'contactPreference'
    ) THEN
        ALTER TABLE "BlogPost" ADD COLUMN "contactPreference" TEXT;
    END IF;
END $$;






