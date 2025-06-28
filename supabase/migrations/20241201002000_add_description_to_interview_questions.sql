-- Add description column to interview_questions table
ALTER TABLE interview_questions 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment to document the new field
COMMENT ON COLUMN interview_questions.description IS 'Optional description or additional context for the question'; 