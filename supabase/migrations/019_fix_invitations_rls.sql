-- Fix RLS policies for invitations table
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Admins can view all invitations" ON invitations;
DROP POLICY IF EXISTS "Anyone can read invitation by token" ON invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON invitations;
DROP POLICY IF EXISTS "Allow all select" ON invitations;
DROP POLICY IF EXISTS "Allow all insert" ON invitations;
DROP POLICY IF EXISTS "Allow all update" ON invitations;

-- Re-create policies with explicit permissions

-- 1. Allow ANYONE to view invitations (needed for registration by token, and for admins to list)
CREATE POLICY "Allow all select invitations"
    ON invitations FOR SELECT
    USING (true);

-- 2. Allow authenticated users to create invitations
CREATE POLICY "Allow authenticated insert invitations"
    ON invitations FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 3. Allow authenticated users to update invitations (cancel, expire)
CREATE POLICY "Allow authenticated update invitations"
    ON invitations FOR UPDATE
    TO authenticated
    USING (true);

-- 4. Debug function to fetch invitations bypassing RLS
-- Use this if the table still appears empty
CREATE OR REPLACE FUNCTION get_all_invitations_debug()
RETURNS SETOF invitations AS $$
BEGIN
    RETURN QUERY SELECT * FROM invitations ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
