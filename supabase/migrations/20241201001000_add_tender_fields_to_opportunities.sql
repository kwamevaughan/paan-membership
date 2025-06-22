-- Tender-specific fields for business_opportunities
ALTER TABLE business_opportunities
ADD COLUMN IF NOT EXISTS is_tender BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tender_organization TEXT,
ADD COLUMN IF NOT EXISTS tender_category TEXT,
ADD COLUMN IF NOT EXISTS tender_issued DATE,
ADD COLUMN IF NOT EXISTS tender_closing DATE,
ADD COLUMN IF NOT EXISTS tender_access_link TEXT;

COMMENT ON COLUMN business_opportunities.is_tender IS 'Whether this opportunity is a tender';
COMMENT ON COLUMN business_opportunities.tender_organization IS 'Tender organization name';
COMMENT ON COLUMN business_opportunities.tender_category IS 'Tender category';
COMMENT ON COLUMN business_opportunities.tender_issued IS 'Tender issued date';
COMMENT ON COLUMN business_opportunities.tender_closing IS 'Tender closing date';
COMMENT ON COLUMN business_opportunities.tender_access_link IS 'Tender access link'; 