-- =====================================================
-- Casa das Tintas - Email Notifications Trigger (FIXED)
-- =====================================================

-- Enable http extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS http;

-- Function to send email notification via Edge Function
CREATE OR REPLACE FUNCTION send_email_notification()
RETURNS TRIGGER AS $$
DECLARE
    user_email text;
    payload jsonb;
    response record;
    function_url text;
BEGIN
    -- Get recipient email
    SELECT email INTO user_email FROM users WHERE id = NEW.recipient_id;
    
    IF user_email IS NULL THEN
        RAISE NOTICE 'User email not found for recipient_id: %', NEW.recipient_id;
        RETURN NEW;
    END IF;

    -- Build payload
    payload := jsonb_build_object(
        'to', user_email,
        'subject', NEW.subject,
        'message', NEW.message
    );

    -- Build function URL using Supabase's built-in reference
    -- The URL is automatically available in the database context
    function_url := current_setting('request.headers', true)::json->>'x-forwarded-host';
    
    IF function_url IS NULL OR function_url = '' THEN
        -- Fallback: construct URL from project reference
        -- You'll need to replace this with your actual project reference
        function_url := 'https://iwtssbwfmtdzfcbfoheq.supabase.co';
    ELSE
        function_url := 'https://' || function_url;
    END IF;

    -- Call Edge Function using service role from environment
    BEGIN
        SELECT * INTO response FROM http((
            'POST',
            function_url || '/functions/v1/send-notification-email',
            ARRAY[
                http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dHNzYndmbXRkemZjYmZvaGVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzc0OTMzNywiZXhwIjoyMDc5MzI1MzM3fQ.A9SyJeD15D6tnQCj4GWrGaWCPGo3qPnX12KX78LRmb8'),
                http_header('Content-Type', 'application/json')
            ],
            'application/json',
            payload::text
        )::http_request);

        -- Log response
        RAISE NOTICE 'Email notification sent to %. Status: %', user_email, response.status;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to send email to %: %', user_email, SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_notification_created ON notifications;

-- Create trigger
CREATE TRIGGER on_notification_created
    AFTER INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION send_email_notification();

-- Verify trigger was created
SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    tgtype as type
FROM pg_trigger 
WHERE tgname = 'on_notification_created';
