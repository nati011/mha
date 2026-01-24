-- Add role column to Admin if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'Admin'
          AND column_name = 'role'
    ) THEN
        ALTER TABLE "Admin" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'admin';
    END IF;
END $$;



