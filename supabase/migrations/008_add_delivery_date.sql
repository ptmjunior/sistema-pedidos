-- Add estimated_delivery_date column to request_items table
ALTER TABLE request_items 
ADD COLUMN estimated_delivery_date DATE;

COMMENT ON COLUMN request_items.estimated_delivery_date IS 'Expected delivery date for the item';
