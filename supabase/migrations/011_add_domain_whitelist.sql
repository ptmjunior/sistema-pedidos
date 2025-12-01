-- Create allowed_domains table
CREATE TABLE IF NOT EXISTS allowed_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID REFERENCES users(id)
);

-- Add RLS policies
ALTER TABLE allowed_domains ENABLE ROW LEVEL SECURITY;

-- Anyone can read allowed domains (for validation)
CREATE POLICY "Anyone can read allowed domains"
    ON allowed_domains FOR SELECT
    USING (true);

-- Only approvers can manage domains
CREATE POLICY "Approvers can manage domains"
    ON allowed_domains FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'approver'
        )
    );

-- Seed initial domains
INSERT INTO allowed_domains (domain) VALUES 
    ('casadastintas-al.com'),
    ('casadastintas-al.com.br'),
    ('miracortintas.com.br'),
    ('lojacasadastintas.com.br')
ON CONFLICT (domain) DO NOTHING;

-- Create validation function
CREATE OR REPLACE FUNCTION validate_user_email_domain()
RETURNS TRIGGER AS $$
DECLARE
    user_domain VARCHAR(255);
BEGIN
    -- Extract domain from email (everything after @)
    user_domain := LOWER(SPLIT_PART(NEW.email, '@', 2));
    
    -- Check if domain is in allowed list
    IF NOT EXISTS (
        SELECT 1 FROM allowed_domains
        WHERE LOWER(domain) = user_domain
    ) THEN
        RAISE EXCEPTION 'Email domain "%" is not allowed. Only corporate emails are permitted. Contact your administrator.', user_domain;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table (fires before insert)
DROP TRIGGER IF EXISTS check_email_domain_before_insert ON users;
CREATE TRIGGER check_email_domain_before_insert
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION validate_user_email_domain();

-- Also validate on update (in case email is changed)
DROP TRIGGER IF EXISTS check_email_domain_before_update ON users;
CREATE TRIGGER check_email_domain_before_update
    BEFORE UPDATE OF email ON users
    FOR EACH ROW
    WHEN (OLD.email IS DISTINCT FROM NEW.email)
    EXECUTE FUNCTION validate_user_email_domain();
