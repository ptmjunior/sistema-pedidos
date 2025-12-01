-- Add active column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Update existing users to be active
UPDATE users SET active = true WHERE active IS NULL;

-- Make active column NOT NULL
ALTER TABLE users ALTER COLUMN active SET NOT NULL;

-- Create index for faster active user queries
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Add comment for documentation
COMMENT ON COLUMN users.active IS 'Whether the user account is active. Inactive users cannot log in.';
