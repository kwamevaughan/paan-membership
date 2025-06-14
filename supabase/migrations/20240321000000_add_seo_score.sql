-- Add seo_score column to blogs table
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;

-- Update existing blogs with calculated SEO scores
UPDATE blogs
SET seo_score = (
  SELECT 
    CASE 
      WHEN 
        -- Title length check (30-60 characters)
        (LENGTH(article_name) >= 30 AND LENGTH(article_name) <= 60) AND
        -- Description length check (120-160 characters)
        (LENGTH(meta_description) >= 120 AND LENGTH(meta_description) <= 160) AND
        -- Content length check (at least 300 words)
        (LENGTH(article_body) >= 300) AND
        -- Keyword presence checks
        (LOWER(article_name) LIKE LOWER(CONCAT('%', focus_keyword, '%'))) AND
        (LOWER(meta_description) LIKE LOWER(CONCAT('%', focus_keyword, '%'))) AND
        (LOWER(article_body) LIKE LOWER(CONCAT('%', focus_keyword, '%')))
      THEN 100
      WHEN 
        -- Title length check (30-60 characters)
        (LENGTH(article_name) >= 30 AND LENGTH(article_name) <= 60) AND
        -- Description length check (120-160 characters)
        (LENGTH(meta_description) >= 120 AND LENGTH(meta_description) <= 160) AND
        -- Content length check (at least 300 words)
        (LENGTH(article_body) >= 300) AND
        -- At least 2 keyword presence checks
        (
          (LOWER(article_name) LIKE LOWER(CONCAT('%', focus_keyword, '%'))) +
          (LOWER(meta_description) LIKE LOWER(CONCAT('%', focus_keyword, '%'))) +
          (LOWER(article_body) LIKE LOWER(CONCAT('%', focus_keyword, '%')))
        ) >= 2
      THEN 80
      WHEN 
        -- Title length check (30-60 characters)
        (LENGTH(article_name) >= 30 AND LENGTH(article_name) <= 60) AND
        -- Description length check (120-160 characters)
        (LENGTH(meta_description) >= 120 AND LENGTH(meta_description) <= 160) AND
        -- Content length check (at least 300 words)
        (LENGTH(article_body) >= 300) AND
        -- At least 1 keyword presence check
        (
          (LOWER(article_name) LIKE LOWER(CONCAT('%', focus_keyword, '%'))) +
          (LOWER(meta_description) LIKE LOWER(CONCAT('%', focus_keyword, '%'))) +
          (LOWER(article_body) LIKE LOWER(CONCAT('%', focus_keyword, '%')))
        ) >= 1
      THEN 60
      ELSE 40
    END
  FROM blogs b2
  WHERE b2.id = blogs.id
); 