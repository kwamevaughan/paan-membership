/**
 * Membership Tiers Configuration
 * 
 * Centralized definition of all membership tiers used throughout the application.
 * Update this file if membership tiers change.
 */

export const MEMBERSHIP_TIERS = [
  "Associate Member",
  "Full Member",
  "Gold Member",
  "Free Member"
];

/**
 * Default tier for new content/opportunities
 */
export const DEFAULT_TIER = "Associate Member";

/**
 * Check if a tier is valid
 * @param {string} tier - The tier to validate
 * @returns {boolean} - Whether the tier is valid
 */
export const isValidTier = (tier) => {
  return MEMBERSHIP_TIERS.includes(tier);
};

/**
 * Get a random tier from available tiers
 * @param {string} excludeTier - Optional tier to exclude from selection
 * @returns {string} - A random tier
 */
export const getRandomTier = (excludeTier = null) => {
  const availableTiers = excludeTier 
    ? MEMBERSHIP_TIERS.filter(tier => tier !== excludeTier)
    : MEMBERSHIP_TIERS;
  
  return availableTiers[Math.floor(Math.random() * availableTiers.length)];
};
