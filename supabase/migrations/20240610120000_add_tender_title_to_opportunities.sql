-- Add tender_title field to business_opportunities table
ALTER TABLE business_opportunities
ADD COLUMN tender_title VARCHAR(255);

COMMENT ON COLUMN business_opportunities.tender_title IS 'Tender title for tender opportunities (optional)'; 