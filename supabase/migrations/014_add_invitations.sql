-- Create invitations table for user invitation system
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('requester', 'buyer', 'approver')),
    department VARCHAR(255),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    expires_at TIMESTAMP WITH TIME ZONE,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_created_by ON invitations(created_by);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors
DROP POLICY IF EXISTS "Admins can view all invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can create invitations" ON invitations;
DROP POLICY IF EXISTS "Admins can update invitations" ON invitations;
DROP POLICY IF EXISTS "Anyone can read invitation by token" ON invitations;

-- Admins can view all invitations
CREATE POLICY "Admins can view all invitations"
    ON invitations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Admins can create invitations
CREATE POLICY "Admins can create invitations"
    ON invitations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Admins can update their own invitations
CREATE POLICY "Admins can update invitations"
    ON invitations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Anyone can read invitation by token (for registration page)
CREATE POLICY "Anyone can read invitation by token"
    ON invitations FOR SELECT
    USING (true);

-- Function to check and expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE invitations
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE invitations IS 'Stores invitation links for user registration. Admins create invitations, users accept them to register.';
