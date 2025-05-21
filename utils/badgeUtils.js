export const getTierBadgeColor = (tier, mode) => {
  if (tier.includes("Founding")) {
    return {
      bg: mode === "dark" ? "bg-blue-900/30" : "bg-blue-50",
      text: mode === "dark" ? "text-blue-200" : "text-blue-800",
      border: mode === "dark" ? "border-blue-800" : "border-blue-200",
    };
  } else if (tier.includes("Full")) {
    return {
      bg: mode === "dark" ? "bg-emerald-900/30" : "bg-emerald-50",
      text: mode === "dark" ? "text-emerald-200" : "text-emerald-800",
      border: mode === "dark" ? "border-emerald-800" : "border-emerald-200",
    };
  } else if (tier.includes("Associate")) {
    return {
      bg: mode === "dark" ? "bg-amber-900/30" : "bg-amber-50",
      text: mode === "dark" ? "text-amber-200" : "text-amber-800",
      border: mode === "dark" ? "border-amber-800" : "border-amber-200",
    };
  } else {
    return {
      bg: mode === "dark" ? "bg-gray-700/30" : "bg-gray-100",
      text: mode === "dark" ? "text-gray-200" : "text-gray-800",
      border: mode === "dark" ? "border-gray-600" : "border-gray-200",
    };
  }
};

export const getStatusBadgeColor = (days, mode) => {
  if (days < 7) {
    return {
      bg: mode === "dark" ? "bg-red-900/30" : "bg-red-50",
      text: mode === "dark" ? "text-red-200" : "text-red-800",
      icon: "text-red-400",
    };
  } else if (days < 14) {
    return {
      bg: mode === "dark" ? "bg-amber-900/30" : "bg-amber-50",
      text: mode === "dark" ? "text-amber-200" : "text-amber-800",
      icon: "text-amber-400",
    };
  } else {
    return {
      bg: mode === "dark" ? "bg-emerald-900/30" : "bg-emerald-50",
      text: mode === "dark" ? "text-emerald-200" : "text-emerald-800",
      icon: "text-emerald-400",
    };
  }
};
