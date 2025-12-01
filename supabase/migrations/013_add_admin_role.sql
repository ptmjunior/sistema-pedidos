-- Add admin role to the system
-- This separates system administration from approval permissions

-- First, check if we're using a CHECK constraint or ENUM
-- We'll use CHECK constraint approach as it's more flexible

-- Drop existing role constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint including 'admin' role
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('requester', 'buyer', 'approver', 'admin'));

-- Promote specific user to admin
-- pedro@casadastintas-al.com becomes the system administrator
UPDATE users 
SET role = 'admin' 
WHERE email = 'pedro@casadastintas-al.com';

-- Add comment for documentation
COMMENT ON COLUMN users.role IS 'User role: requester (create requests), buyer (mark as purchased), approver (approve/reject requests), admin (full system access)';

-- Update RLS policies to include admin role where approvers had access
-- This ensures admins can do everything approvers can do

-- For allowed_domains table - only admins can manage
DROP POLICY IF EXISTS "Approvers can manage domains" ON allowed_domains;
CREATE POLICY "Admins can manage domains"
    ON allowed_domains FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );
