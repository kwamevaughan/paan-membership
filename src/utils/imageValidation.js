/**
 * Utility functions for validating and sanitizing image URLs
 */

/**
 * Check if a URL is a valid image URL (not base64 data URL)
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Reject base64 data URLs
  if (url.startsWith('data:')) {
    console.warn('Base64 data URL detected and rejected:', url.substring(0, 50) + '...');
    return false;
  }

  // Accept http/https URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }

  // Accept relative URLs (for local development)
  if (url.startsWith('/')) {
    return true;
  }

  console.warn('Invalid image URL format:', url);
  return false;
}

/**
 * Sanitize an image URL, returning null if invalid
 * @param {string} url - The URL to sanitize
 * @returns {string|null} - The sanitized URL or null
 */
export function sanitizeImageUrl(url) {
  return isValidImageUrl(url) ? url : null;
}

/**
 * Get a safe image URL with fallback
 * @param {string} url - The URL to validate
 * @param {string} fallback - Fallback URL if invalid
 * @returns {string} - The validated URL or fallback
 */
export function getSafeImageUrl(url, fallback = '') {
  return isValidImageUrl(url) ? url : fallback;
}

/**
 * Filter an array of image objects, removing those with invalid URLs
 * @param {Array} images - Array of image objects with 'url' property
 * @returns {Array} - Filtered array
 */
export function filterValidImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter(img => img && isValidImageUrl(img.url));
}
