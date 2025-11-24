-- =====================================================
-- Casa das Tintas - FIX: Allow User Creation
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Allow authenticated users to insert into users table
-- This is necessary for the "Add User" feature where an admin creates another user
CREATE POLICY "Authenticated users can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete users (for the delete feature)
CREATE POLICY "Authenticated users can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (true);
