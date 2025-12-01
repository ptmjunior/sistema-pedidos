-- =====================================================
-- Fix: Allow User Registration via Invitation
-- This allows the registration process to create user profiles
-- even when not authenticated (during invitation acceptance)
-- =====================================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can insert users" ON users;

-- Allow service role (anon key with proper permissions) to insert users
-- This is used during the invitation registration flow
CREATE POLICY "Allow user registration via invitation"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Recreate the authenticated insert policy with a different name to avoid conflicts
CREATE POLICY "Authenticated users can manage users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);
