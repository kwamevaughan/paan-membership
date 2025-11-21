// Cache for extracted keywords to avoid reprocessing
const keywordCache = new Map();

/**
 * Extract meaningful keywords from HTML content
 */
function extractKeywords(htmlContent, limit = 20) {
  if (!htmlContent) return [];
  
  // Check cache first
  const cacheKey = htmlContent.substring(0, 100); // Use first 100 chars as key
  if (keywordCache.has(cacheKey)) {
    return keywordCache.get(cacheKey);
  }

  // Remove HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, ' ').toLowerCase();
  
  // Common stop words to ignore
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
    'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
    'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
    'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
    'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
    'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did',
    'having', 'may', 'should', 'am', 'being', 'more', 'very', 'such', 'here', 'much'
  ]);

  // Extract words (3+ characters)
  const words = text.match(/\b[a-z]{3,}\b/g) || [];
  
  // Count word frequency
  const wordFreq = {};
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Sort by frequency and get top keywords
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);

  // Cache the result
  keywordCache.set(cacheKey, keywords);
  
  return keywords;
}

/**
 * Extract headings from HTML content
 */
function extractHeadings(htmlContent) {
  if (!htmlContent) return [];
  
  const headingMatches = htmlContent.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi) || [];
  return headingMatches
    .map(h => h.replace(/<[^>]*>/g, '').toLowerCase().trim())
    .filter(h => h.length > 0);
}

/**
 * Calculate content similarity based on keyword overlap
 */
function calculateContentSimilarity(keywords1, keywords2) {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  const intersection = [...set1].filter(k => set2.has(k));
  
  return intersection.length / Math.max(keywords1.length, keywords2.length);
}

/**
 * Find related articles for internal linking
 * Scores articles based on content analysis, category, tags, and keywords
 */
export function findRelatedArticles(currentBlog, allBlogs, limit = 3) {
  if (!currentBlog || !allBlogs || allBlogs.length === 0) {
    return [];
  }

  // Extract keywords and headings from current article
  const currentKeywords = extractKeywords(currentBlog.article_body, 20);
  const currentHeadings = extractHeadings(currentBlog.article_body);

  const scoredArticles = allBlogs
    .filter(blog => {
      // Exclude current article and unpublished articles
      return blog.id !== currentBlog.id && blog.is_published;
    })
    .map(blog => {
      let score = 0;
      const reasons = [];

      // Content keyword similarity (40 points) - MOST IMPORTANT
      const blogKeywords = extractKeywords(blog.article_body, 20);
      const keywordSimilarity = calculateContentSimilarity(currentKeywords, blogKeywords);
      if (keywordSimilarity > 0.1) {
        const keywordScore = Math.round(keywordSimilarity * 40);
        score += keywordScore;
        reasons.push(`${Math.round(keywordSimilarity * 100)}% content match`);
      }

      // Heading topic similarity (20 points)
      const blogHeadings = extractHeadings(blog.article_body);
      const headingSimilarity = calculateContentSimilarity(currentHeadings, blogHeadings);
      if (headingSimilarity > 0.1) {
        const headingScore = Math.round(headingSimilarity * 20);
        score += headingScore;
        reasons.push('Similar topics');
      }

      // Category match (15 points) - reduced weight
      if (blog.category_id && currentBlog.category_id) {
        if (blog.category_id === currentBlog.category_id) {
          score += 15;
          reasons.push('Same category');
        }
      }

      // Tag overlap (10 points per shared tag, max 20) - reduced weight
      const currentTags = Array.isArray(currentBlog.article_tags) 
        ? currentBlog.article_tags 
        : [];
      const blogTags = Array.isArray(blog.article_tags) 
        ? blog.article_tags 
        : [];
      
      const sharedTags = currentTags.filter(tag => blogTags.includes(tag));
      if (sharedTags.length > 0) {
        const tagScore = Math.min(sharedTags.length * 10, 20);
        score += tagScore;
        reasons.push(`${sharedTags.length} shared tag${sharedTags.length > 1 ? 's' : ''}`);
      }

      // Focus keyword match (15 points)
      if (blog.focus_keyword && currentBlog.focus_keyword) {
        const blogKeyword = blog.focus_keyword.toLowerCase();
        const currentKeyword = currentBlog.focus_keyword.toLowerCase();
        
        if (blogKeyword === currentKeyword) {
          score += 15;
          reasons.push('Same focus keyword');
        } else if (blogKeyword.includes(currentKeyword) || currentKeyword.includes(blogKeyword)) {
          score += 8;
          reasons.push('Similar keyword');
        }
      }

      // Title similarity (10 points)
      if (blog.article_name && currentBlog.article_name) {
        const similarity = calculateTitleSimilarity(
          blog.article_name,
          currentBlog.article_name
        );
        if (similarity > 0.2) {
          score += Math.round(similarity * 10);
          reasons.push('Similar title');
        }
      }

      return {
        ...blog,
        matchScore: score,
        matchReasons: reasons,
        matchPercentage: Math.min(Math.round((score / 100) * 100), 100)
      };
    })
    .filter(article => article.matchScore > 15) // Lower threshold for content-based matching
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scoredArticles;
}

/**
 * Calculate similarity between two titles using word overlap
 */
function calculateTitleSimilarity(title1, title2) {
  const words1 = title1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = title2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
}

/**
 * Generate internal link HTML
 */
export function generateInternalLink(article, anchorText = null) {
  const text = anchorText || article.article_name;
  const url = `/blog/${article.slug}`;
  return `<a href="${url}">${text}</a>`;
}

/**
 * Get suggested anchor text based on article
 */
export function getSuggestedAnchorText(article) {
  const suggestions = [];
  
  // Article title
  suggestions.push(article.article_name);
  
  // Focus keyword
  if (article.focus_keyword) {
    suggestions.push(article.focus_keyword);
  }
  
  // Short version of title (first 5 words)
  const shortTitle = article.article_name.split(' ').slice(0, 5).join(' ');
  if (shortTitle !== article.article_name) {
    suggestions.push(shortTitle + '...');
  }
  
  return suggestions;
}
