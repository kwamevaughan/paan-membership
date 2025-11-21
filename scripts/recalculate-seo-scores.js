const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with SERVICE_ROLE key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

console.log(`🔑 Using ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON'} key for database access\n`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SEO Score calculation function (matching the one in src/utils/seo.js)
function calculateSEOScore(formData, editorContent) {
  let score = 0;
  const maxScore = 100;

  // === CRITICAL SEO FACTORS (50 points) ===
  
  // Focus keyword in title (12 points)
  if (formData.article_name?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) {
    score += 12;
  } else if (formData.article_name && formData.focus_keyword) {
    score += 3;
  }
  
  // Focus keyword in meta description (10 points)
  if (formData.meta_description?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) {
    score += 10;
  } else if (formData.meta_description && formData.focus_keyword) {
    score += 3;
  }
  
  // Focus keyword in URL (8 points)
  if (formData.slug?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) {
    score += 8;
  } else if (formData.slug) {
    score += 2;
  }
  
  // Focus keyword in content (10 points)
  if (editorContent?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) {
    score += 10;
  }
  
  // Content length (10 points)
  const wordCount = editorContent?.split(/\s+/).filter(Boolean).length || 0;
  if (wordCount >= 600) {
    score += 10;
  } else if (wordCount >= 400) {
    score += 8;
  } else if (wordCount >= 300) {
    score += 6;
  } else if (wordCount >= 200) {
    score += 3;
  }

  // === IMPORTANT SEO FACTORS (30 points) ===
  
  // Focus keyword in headings (10 points)
  const headings = editorContent?.match(/<h[2-4][^>]*>.*?<\/h[2-4]>/gi) || [];
  if (headings.some(h => h.toLowerCase().includes(formData.focus_keyword?.toLowerCase()))) {
    score += 10;
  } else if (headings.length > 0) {
    score += 3;
  }
  
  // Focus keyword in alt text (8 points)
  const altTexts = editorContent?.match(/alt="[^"]*"/gi) || [];
  const hasAltWithKeyword = altTexts.some(alt => alt.toLowerCase().includes(formData.focus_keyword?.toLowerCase()));
  const hasFeaturedImageAlt = formData.article_image && formData.focus_keyword;
  if (hasAltWithKeyword || hasFeaturedImageAlt) {
    score += 8;
  } else if (formData.article_image) {
    score += 3;
  }
  
  // Keyword density (7 points)
  const density = editorContent ? ((editorContent.toLowerCase().match(new RegExp(formData.focus_keyword?.toLowerCase(), 'g')) || []).length / (wordCount || 1)) * 100 : 0;
  if (density >= 0.5 && density <= 2.5) {
    score += 7;
  } else if (density >= 0.3 && density <= 3.5) {
    score += 5;
  } else if (density > 0) {
    score += 2;
  }
  
  // Internal links (5 points)
  if (editorContent?.includes('href="/')) {
    score += 5;
  }

  // === BONUS FACTORS (20 points) ===
  
  // External links (4 points)
  if (editorContent?.includes('href="http')) {
    score += 4;
  }
  
  // URL length (4 points)
  if (formData.slug?.length <= 60) {
    score += 4;
  } else if (formData.slug?.length <= 80) {
    score += 2;
  }
  
  // Numbers in title (3 points)
  if (/\d+/.test(formData.article_name)) {
    score += 3;
  }
  
  // Has images (4 points)
  if (editorContent?.includes('<img')) {
    score += 4;
  }
  
  // Engaging title words (3 points)
  const engagingWords = ['best', 'top', 'guide', 'how', 'why', 'ultimate', 'complete', 'essential', 'proven', 'tips', 'ways'];
  if (engagingWords.some(word => formData.article_name?.toLowerCase().includes(word))) {
    score += 3;
  }
  
  // Focus keyword near start of title (2 points)
  const firstWords = formData.article_name?.toLowerCase().split(' ').slice(0, 5).join(' ');
  if (firstWords?.includes(formData.focus_keyword?.toLowerCase())) {
    score += 2;
  }

  return Math.min(Math.round(score), maxScore);
}

async function recalculateSEOScores() {
  console.log('🔄 Starting SEO score recalculation for all articles...\n');

  try {
    // Fetch all blogs (both published and drafts)
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('id, article_name, slug, article_body, focus_keyword, meta_description, article_image, is_published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching blogs:', error);
      return;
    }

    console.log(`📚 Found ${blogs.length} articles to process\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const blog of blogs) {
      try {
        // Calculate new SEO score
        const newScore = calculateSEOScore(
          {
            article_name: blog.article_name,
            slug: blog.slug,
            focus_keyword: blog.focus_keyword,
            meta_description: blog.meta_description,
            article_image: blog.article_image,
          },
          blog.article_body
        );

        // Update the blog with new SEO score
        const { error: updateError } = await supabase
          .from('blogs')
          .update({ seo_score: newScore })
          .eq('id', blog.id);

        if (updateError) {
          console.error(`❌ Error updating blog ${blog.id}:`, updateError.message);
          errors++;
        } else {
          console.log(`✅ Updated: "${blog.article_name}" - Score: ${newScore}%`);
          updated++;
        }
      } catch (err) {
        console.error(`❌ Error processing blog ${blog.id}:`, err.message);
        errors++;
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 Summary:');
    console.log(`   ✅ Updated: ${updated} articles`);
    console.log(`   ⏭️  Skipped: ${skipped} articles`);
    console.log(`   ❌ Errors: ${errors} articles`);
    console.log(`${'='.repeat(80)}\n`);

    console.log('✨ SEO score recalculation completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
recalculateSEOScores();
