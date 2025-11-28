-- Migration to add 'open' and 'purchased' status values
-- This migration updates the status constraint to include the new workflow statuses

-- Drop the old constraint
ALTER TABLE purchase_requests 
DROP CONSTRAINT IF EXISTS purchase_requests_status_check;

-- Add new constraint with all status values
ALTER TABLE purchase_requests 
ADD CONSTRAINT purchase_requests_status_check 
CHECK (status IN ('open', 'pending', 'approved', 'rejected', 'purchased'));

-- Update default value to 'open' instead of 'pending'
ALTER TABLE purchase_requests 
ALTER COLUMN status SET DEFAULT 'open';

-- Optional: Update existing 'pending' requests to 'open' (uncomment if needed)
-- UPDATE purchase_requests SET status = 'open' WHERE status = 'pending';
