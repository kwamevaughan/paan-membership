/**
 * Shared React Select styles for consistent look and feel across the application
 * Supports both light and dark modes and uses brand colors from Tailwind config
 *
 * Brand Colors Used:
 * - richBlue: #1b234f (primary focus and selection color)
 * - richBlueLight: #3a517d (hover and active states)
 *
 * @param {string} mode - Current theme mode ('light' or 'dark')
 * @returns {Object} React Select styles object
 */

export const getSelectStyles = (mode = "light") => {
  const isDark = mode === "dark";
  const textColor = isDark ? "#E5E7EB" : "#111827";
  const bgColor = isDark ? "#1F2937" : "white";
  const borderColor = isDark ? "#4B5563" : "#D1D5DB";
  const hoverBorderColor = isDark ? "#6B7280" : "#1b234f"; // richBlue
  const focusBorderColor = "#1b234f"; // richBlue
  const placeholderColor = isDark ? "#9CA3AF" : "#6B7280";
  const optionHoverBg = isDark ? "#374151" : "#f0f4ff"; // Light blue tint
  const optionSelectedBg = "#1b234f"; // richBlue
  const optionSelectedColor = "white";

  return {
    control: (provided, state) => ({
      ...provided,
      minHeight: "42px",
      fontSize: "14px",
      backgroundColor: bgColor,
      borderColor: state.isFocused ? focusBorderColor : borderColor,
      borderWidth: "1px",
      borderRadius: "0.375rem",
      boxShadow: state.isFocused ? `0 0 0 2px rgba(27, 35, 79, 0.2)` : "none", // richBlue with opacity
      "&:hover": {
        borderColor: hoverBorderColor,
      },
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: "14px",
      padding: "8px 12px",
      backgroundColor: state.isSelected
        ? optionSelectedBg
        : state.isFocused
        ? optionHoverBg
        : bgColor,
      color: state.isSelected ? optionSelectedColor : textColor,
      "&:active": {
        backgroundColor: isDark ? "#4B5563" : "#3a517d", // richBlueLight for active state
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Ensure dropdown appears above modals
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: "0.375rem",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: placeholderColor,
      fontSize: "14px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: textColor,
      fontSize: "14px",
    }),
    input: (provided) => ({
      ...provided,
      color: textColor,
      fontSize: "14px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: placeholderColor,
      "&:hover": {
        color: isDark ? "#D1D5DB" : "#1b234f", // richBlue on hover
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: placeholderColor,
      "&:hover": {
        color: isDark ? "#D1D5DB" : "#1b234f", // richBlue on hover
      },
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    loadingIndicator: (provided) => ({
      ...provided,
      color: placeholderColor,
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: placeholderColor,
      fontSize: "14px",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDark ? "#374151" : "#E5E7EB",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: textColor,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: placeholderColor,
      "&:hover": {
        backgroundColor: isDark ? "#4B5563" : "#3a517d", // richBlueLight
        color: "white",
      },
    }),
  };
};

// Default export for backward compatibility
export default getSelectStyles;
