-- Fix RLS policies to allow admins to manage users
-- This enables admins to DELETE and UPDATE any user

-- 1. Allow admins to DELETE users
DROP POLICY IF EXISTS "Admins can delete users" ON users;
CREATE POLICY "Admins can delete users"
    ON users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 2. Allow admins to UPDATE users (e.g. toggle active status, change role)
DROP POLICY IF EXISTS "Admins can update users" ON users;
CREATE POLICY "Admins can update users"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 3. Update Foreign Key on purchase_requests to allow user deletion
-- When a user is deleted, their requests should remain but user_id set to NULL
ALTER TABLE purchase_requests
DROP CONSTRAINT IF EXISTS purchase_requests_user_id_fkey;

ALTER TABLE purchase_requests
ADD CONSTRAINT purchase_requests_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL;

-- 4. Update Foreign Key on request_comments
ALTER TABLE request_comments
DROP CONSTRAINT IF EXISTS request_comments_user_id_fkey;

ALTER TABLE request_comments
ADD CONSTRAINT request_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL;

-- 5. Update Foreign Key on notifications
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey;

ALTER TABLE notifications
ADD CONSTRAINT notifications_recipient_id_fkey
FOREIGN KEY (recipient_id) REFERENCES users(id)
ON DELETE CASCADE; -- If user is deleted, their notifications can be deleted

-- 6. Update Foreign Key on invitations (created_by and used_by)
ALTER TABLE invitations
DROP CONSTRAINT IF EXISTS invitations_created_by_fkey;

ALTER TABLE invitations
ADD CONSTRAINT invitations_created_by_fkey
FOREIGN KEY (created_by) REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE invitations
DROP CONSTRAINT IF EXISTS invitations_used_by_fkey;

ALTER TABLE invitations
ADD CONSTRAINT invitations_used_by_fkey
FOREIGN KEY (used_by) REFERENCES users(id)
ON DELETE SET NULL;

-- 7. Update Foreign Key on allowed_domains
ALTER TABLE allowed_domains
DROP CONSTRAINT IF EXISTS allowed_domains_created_by_fkey;

ALTER TABLE allowed_domains
ADD CONSTRAINT allowed_domains_created_by_fkey
FOREIGN KEY (created_by) REFERENCES users(id)
ON DELETE SET NULL;
