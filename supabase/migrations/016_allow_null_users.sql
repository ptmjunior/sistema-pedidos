-- Migration to allow NULL values for user_id columns
-- This is required for ON DELETE SET NULL to work when a user is deleted

-- 1. Allow NULL in purchase_requests.user_id
ALTER TABLE purchase_requests
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Allow NULL in request_comments.user_id
ALTER TABLE request_comments
ALTER COLUMN user_id DROP NOT NULL;

-- 3. Allow NULL in invitations.created_by and used_by (just to be safe, though usually nullable)
ALTER TABLE invitations
ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE invitations
ALTER COLUMN used_by DROP NOT NULL;

-- 4. Allow NULL in allowed_domains.created_by
ALTER TABLE allowed_domains
ALTER COLUMN created_by DROP NOT NULL;

-- Add comment explaining why
COMMENT ON COLUMN purchase_requests.user_id IS 'User who made the request. Can be NULL if user was deleted.';
COMMENT ON COLUMN request_comments.user_id IS 'User who made the comment. Can be NULL if user was deleted.';
