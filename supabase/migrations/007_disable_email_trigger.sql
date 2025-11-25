-- Disable the old email notification trigger to prevent duplicate emails
-- The new system handles emails via Vercel Serverless Functions with better formatting

DROP TRIGGER IF EXISTS on_notification_created ON notifications;
DROP FUNCTION IF EXISTS send_email_notification();
