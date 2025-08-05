-- Add pid field to users table
-- This migration adds a new `pid` field for Police ID and removes the department index

-- Step 1: Add the new pid column
ALTER TABLE "users" ADD COLUMN "pid" TEXT;

-- Step 2: Update existing users to move badgeNumber data to pid field
-- (In production, you would need to carefully handle this data migration)
UPDATE "users" SET "pid" = "badge_number" WHERE "badge_number" IS NOT NULL;

-- Step 3: Make pid column required and unique
ALTER TABLE "users" ALTER COLUMN "pid" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_pid_key" UNIQUE ("pid");

-- Step 4: Create index on pid field
CREATE INDEX "idx_users_pid" ON "users"("pid");

-- Step 5: Drop the department index (optional - can be kept if needed)
DROP INDEX IF EXISTS "idx_users_department";

-- Note: The badgeNumber field is kept separate from PID as requested
-- Department field is also kept for potential future use in user profiles