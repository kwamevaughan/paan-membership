-- Add attachment fields to business_opportunities table
ALTER TABLE business_opportunities 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_size BIGINT;

-- Add comment to document the new fields
COMMENT ON COLUMN business_opportunities.attachment_url IS 'URL of the uploaded attachment file';
COMMENT ON COLUMN business_opportunities.attachment_name IS 'Original filename of the attachment';
COMMENT ON COLUMN business_opportunities.attachment_type IS 'MIME type of the attachment file';
COMMENT ON COLUMN business_opportunities.attachment_size IS 'Size of the attachment file in bytes'; 