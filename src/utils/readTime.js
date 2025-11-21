/**
 * Calculates the estimated read time for a blog post
 * @param {string} content - The HTML content of the blog post
 * @returns {string} - The estimated read time in minutes
 */
export const calculateReadTime = (content) => {
  if (!content) return '5 min read';

  // Constants for calculation
  const WORDS_PER_MINUTE = 200; // Average reading speed
  const IMAGE_READ_TIME = 12; // seconds per image
  const CODE_BLOCK_READ_TIME = 20; // seconds per code block

  // Remove HTML tags and get clean text
  const cleanText = content.replace(/<[^>]*>/g, '');
  
  // Count words (split by whitespace and filter out empty strings)
  const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
  
  // Count images
  const imageCount = (content.match(/<img[^>]*>/g) || []).length;
  
  // Count code blocks
  const codeBlockCount = (content.match(/<pre[^>]*>[\s\S]*?<\/pre>/g) || []).length;
  
  // Calculate base reading time in minutes
  const baseReadTime = wordCount / WORDS_PER_MINUTE;
  
  // Add time for images and code blocks
  const imageTime = (imageCount * IMAGE_READ_TIME) / 60; // convert to minutes
  const codeBlockTime = (codeBlockCount * CODE_BLOCK_READ_TIME) / 60; // convert to minutes
  
  // Total read time in minutes
  const totalReadTime = baseReadTime + imageTime + codeBlockTime;
  
  // Round up to nearest minute
  const roundedReadTime = Math.ceil(totalReadTime);
  
  // Ensure minimum read time of 1 minute
  const finalReadTime = Math.max(1, roundedReadTime);
  
  return `${finalReadTime} min read`;
};
