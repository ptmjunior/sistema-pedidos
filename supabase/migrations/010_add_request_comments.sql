-- Migration to add request comments/history table
-- This table will store all interactions on a purchase request

CREATE TABLE request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES purchase_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('status_change', 'comment', 'edit')),
  old_status TEXT,
  new_status TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX idx_request_comments_created_at ON request_comments(created_at DESC);

-- Comment for documentation
COMMENT ON TABLE request_comments IS 'History of all interactions and status changes on purchase requests';
COMMENT ON COLUMN request_comments.comment_type IS 'Type of interaction: status_change, comment, or edit';
COMMENT ON COLUMN request_comments.old_status IS 'Previous status (for status_change type)';
COMMENT ON COLUMN request_comments.new_status IS 'New status (for status_change type)';
COMMENT ON COLUMN request_comments.comment IS 'Comment text from user';
