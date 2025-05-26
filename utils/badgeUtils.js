// Cache for storing previously calculated tier colors
const tierCache = {};

// Cache for storing previously calculated status colors
const statusCache = {};

// Normalize tier strings to prevent case/spacing issues
const normalizeTier = (tier) => {
  // Remove everything after a parenthesis (if any), then trim and convert to lowercase
  return tier.split("(")[0].trim().toLowerCase();
};

// Tier Color Map (Same as before, just simplified)
const tierColors = {
  "associate member": {
    dark: {
      bg: "bg-blue-900/30",
      text: "text-blue-200",
      border: "border-blue-800",
    },
    light: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-200",
    },
  },
  "full member": {
    dark: {
      bg: "bg-emerald-900/30",
      text: "text-emerald-200",
      border: "border-emerald-800",
    },
    light: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
    },
  },
  "gold member": {
    dark: {
      bg: "bg-yellow-900/30",
      text: "text-yellow-200",
      border: "border-yellow-800",
    },
    light: {
      bg: "bg-amber-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
    },
  },
  "free member": {
    dark: {
      bg: "bg-red-900/30",
      text: "text-red-200",
      border: "border-red-800",
    },
    light: {
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-200",
    },
  },
  default: {
    dark: {
      bg: "bg-gray-700/30",
      text: "text-gray-200",
      border: "border-gray-600",
    },
    light: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
    },
  },
};

// Status Color Map
const statusColors = {
  7: {
    dark: {
      bg: "bg-red-900/30",
      text: "text-red-200",
      icon: "text-red-400",
    },
    light: {
      bg: "bg-red-50",
      text: "text-red-800",
      icon: "text-red-400",
    },
  },
  14: {
    dark: {
      bg: "bg-amber-900/30",
      text: "text-amber-200",
      icon: "text-amber-400",
    },
    light: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      icon: "text-amber-400",
    },
  },
  default: {
    dark: {
      bg: "bg-emerald-900/30",
      text: "text-emerald-200",
      icon: "text-emerald-400",
    },
    light: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      icon: "text-emerald-400",
    },
  },
};

// Helper function to get mode-based colors
const getModeColors = (key, mode, colorMap) => {
  const colorKey = colorMap[key] || colorMap["default"];
  return colorKey[mode];
};

// Optimized getTierBadgeColor with caching
export const getTierBadgeColor = (tier, mode) => {
  // Normalize the tier name
  const normalizedTier = normalizeTier(tier);

  // Check cache first
  if (tierCache[normalizedTier] && tierCache[normalizedTier][mode]) {
    return tierCache[normalizedTier][mode];
  }

  // Find the appropriate color set for the tier
  const tierColorSet = tierColors[normalizedTier] || tierColors["default"];

  // Cache the result for future calls
  if (!tierCache[normalizedTier]) {
    tierCache[normalizedTier] = {};
  }
  tierCache[normalizedTier][mode] = tierColorSet[mode];

  return tierColorSet[mode];
};

// Optimized getStatusBadgeColor with caching
export const getStatusBadgeColor = (days, mode) => {
  // Check cache first
  if (statusCache[days] && statusCache[days][mode]) {
    return statusCache[days][mode];
  }

  // Determine the correct status key
  let statusKey;
  if (days < 7) {
    statusKey = 7;
  } else if (days < 14) {
    statusKey = 14;
  } else {
    statusKey = "default";
  }

  const colorSet = getModeColors(statusKey, mode, statusColors);

  // Cache the result for future calls
  if (!statusCache[days]) {
    statusCache[days] = {};
  }
  statusCache[days][mode] = colorSet;

  return colorSet;
};
