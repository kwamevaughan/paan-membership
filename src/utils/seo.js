export const calculateSEOScore = (formData, editorContent) => {
  let score = 0;
  const maxScore = 100;

  // === CRITICAL SEO FACTORS (50 points) - Must-haves ===
  
  // Focus keyword in title (12 points)
  if (formData.article_name?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) {
    score += 12;
  } else if (formData.article_name && formData.focus_keyword) {
    // Partial credit if title exists but no keyword
    score += 3;
  }
  
  // Focus keyword in meta description (10 points)
  if (formData.description?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) {
    score += 10;
  } else if (formData.description && formData.focus_keyword) {
    score += 3; // Partial credit
  }
  
  // Focus keyword in URL (8 points)
  if (formData.slug?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) {
    score += 8;
  } else if (formData.slug) {
    score += 2; // Partial credit for having a slug
  }
  
  // Focus keyword in content (10 points)
  if (editorContent?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) {
    score += 10;
  }
  
  // Content length (10 points with generous partial credit)
  const wordCount = editorContent?.split(/\s+/).filter(Boolean).length || 0;
  if (wordCount >= 600) {
    score += 10;
  } else if (wordCount >= 400) {
    score += 8; // Good enough
  } else if (wordCount >= 300) {
    score += 6; // Minimum acceptable
  } else if (wordCount >= 200) {
    score += 3; // Short but exists
  }

  // === IMPORTANT SEO FACTORS (30 points) ===
  
  // Focus keyword in headings (10 points)
  const headings = editorContent?.match(/<h[2-4][^>]*>.*?<\/h[2-4]>/gi) || [];
  if (headings.some(h => h.toLowerCase().includes(formData.focus_keyword?.toLowerCase()))) {
    score += 10;
  } else if (headings.length > 0) {
    score += 3; // Has headings but no keyword
  }
  
  // Focus keyword in alt text (8 points)
  const altTexts = editorContent?.match(/alt="[^"]*"/gi) || [];
  const hasAltWithKeyword = altTexts.some(alt => alt.toLowerCase().includes(formData.focus_keyword?.toLowerCase()));
  const hasFeaturedImageAlt = formData.article_image && formData.focus_keyword;
  if (hasAltWithKeyword || hasFeaturedImageAlt) {
    score += 8;
  } else if (formData.article_image) {
    score += 3; // Has image but no keyword in alt
  }
  
  // Keyword density (7 points - more lenient)
  const density = editorContent ? ((editorContent.toLowerCase().match(new RegExp(formData.focus_keyword?.toLowerCase(), 'g')) || []).length / (wordCount || 1)) * 100 : 0;
  if (density >= 0.5 && density <= 2.5) {
    score += 7; // Perfect range
  } else if (density >= 0.3 && density <= 3.5) {
    score += 5; // Acceptable range
  } else if (density > 0) {
    score += 2; // At least keyword appears
  }
  
  // Internal links (5 points)
  if (editorContent?.includes('href="/')) {
    score += 5;
  }

  // === BONUS FACTORS (20 points) - Nice to have ===
  
  // External links (4 points)
  if (editorContent?.includes('href="http')) {
    score += 4;
  }
  
  // URL length (4 points)
  if (formData.slug?.length <= 60) {
    score += 4;
  } else if (formData.slug?.length <= 80) {
    score += 2; // Acceptable
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
};

export const getScoreColor = (score, mode) => {
  if (score >= 60) return mode === 'dark' ? 'text-green-400' : 'text-green-600'; // Good - Ready to publish
  if (score >= 40) return mode === 'dark' ? 'text-yellow-400' : 'text-yellow-600'; // Fair - Needs some work
  return mode === 'dark' ? 'text-red-400' : 'text-red-600'; // Poor - Needs significant work
};

export const getScoreBgColor = (score, mode) => {
  if (score >= 60) return mode === 'dark' ? 'bg-green-900/20' : 'bg-green-50';
  if (score >= 40) return mode === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50';
  return mode === 'dark' ? 'bg-red-900/20' : 'bg-red-50';
};

export const getScoreIcon = (score) => {
  if (score >= 60) return 'heroicons:check-circle'; // Good
  if (score >= 40) return 'heroicons:exclamation-circle'; // Fair
  return 'heroicons:x-circle'; // Poor
}; 