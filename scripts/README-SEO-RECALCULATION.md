# SEO Score Recalculation Script

This script recalculates SEO scores for all existing blog articles using the updated scoring algorithm.

## When to Use

Run this script when:
- You've updated the SEO scoring algorithm
- You want to refresh scores for all existing articles
- You've made changes to SEO calculation logic

## How to Run

```bash
# From the paan-membership directory
node scripts/recalculate-seo-scores.js
```

## What It Does

1. Fetches all blog articles from the database
2. Calculates new SEO score for each article using the current algorithm
3. Updates the `seo_score` field in the database
4. Provides a summary of updated, skipped, and failed articles

## Output Example

```
🔄 Starting SEO score recalculation for all articles...

📚 Found 22 articles to process

✅ Updated: "How African markets are the future of Digital Advertising" - Score: 67%
✅ Updated: "Top 5 Communication Tools for Agencies in Africa" - Score: 72%
✅ Updated: "Top 5 Agency Pricing Models in Africa" - Score: 65%
...

================================================================================
📊 Summary:
   ✅ Updated: 22 articles
   ⏭️  Skipped: 0 articles
   ❌ Errors: 0 articles
================================================================================

✨ SEO score recalculation completed!
```

## Requirements

- Node.js installed
- `.env` file with Supabase credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Notes

- The script processes both published and draft articles
- Scores are calculated based on the current SEO algorithm in `src/utils/seo.js`
- The script is safe to run multiple times
- No data is deleted, only the `seo_score` field is updated

## Troubleshooting

If you get an error about missing Supabase credentials:
```bash
# Make sure your .env file exists and has the correct values
cat .env | grep SUPABASE
```

If you get database errors:
- Check that your Supabase credentials are correct
- Ensure you have write access to the `blogs` table
