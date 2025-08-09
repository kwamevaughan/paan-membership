/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
 * @param {number} day - The day number
 * @returns {string} The ordinal suffix
 */
const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

/**
 * Format date as "29th Jul, 2025"
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateWithOrdinal = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const year = date.getFullYear();
  
  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
};

/**
 * Format date for relative time display (used in profile header)
 * @param {string|Date} dateString - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Less than 1 minute
  if (diffMinutes < 1) return "Just now";
  
  // Less than 1 hour
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  
  // Less than 24 hours
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  
  // Exactly 1 day
  if (diffDays === 1) return "Yesterday";
  
  // Less than 7 days
  if (diffDays < 7) return `${diffDays} days ago`;
  
  // Less than 30 days
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) === 1 ? '' : 's'} ago`;
  
  // Less than 365 days
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) === 1 ? '' : 's'} ago`;
  
  // More than a year
  return formatDateWithOrdinal(dateString);
};

/**
 * Format date for standard display (used in WelcomeCard)
 * @param {string|Date} dateString - The date to format
 * @returns {string} Standard formatted date
 */
export const formatStandardDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format date as DD/MM/YYYY (used in jobs page)
 * @param {string|Date} dateString - The date to format
 * @returns {string} Date formatted as DD/MM/YYYY
 */
export const formatDateDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format date with time (from utils/dateUtils.js)
 * @param {string|Date} dateString - The date to format
 * @returns {string} Date formatted with time
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleString("en-US", options);
};

/**
 * Get days remaining until a date
 * @param {string|Date} date - The target date
 * @returns {number} Number of days remaining
 */
export const getDaysRemaining = (date) => {
  if (!date) return 0;
  
  const today = new Date();
  const eventDate = new Date(date);
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};