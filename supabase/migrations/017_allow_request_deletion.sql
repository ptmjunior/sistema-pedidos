-- Migration to allow admins to delete purchase requests
-- and ensure related data (notifications) are cleaned up

-- 1. Allow admins to DELETE purchase_requests
DROP POLICY IF EXISTS "Admins can delete requests" ON purchase_requests;
CREATE POLICY "Admins can delete requests"
    ON purchase_requests FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- 2. Update Foreign Key on notifications to CASCADE delete when request is deleted
-- Currently it might restrict deletion or set to null
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_request_id_fkey;

ALTER TABLE notifications
ADD CONSTRAINT notifications_request_id_fkey
FOREIGN KEY (request_id) REFERENCES purchase_requests(id)
ON DELETE CASCADE;

-- Note: request_items and request_comments already have ON DELETE CASCADE
-- defined in their initial creation scripts (001 and 010 respectively).
