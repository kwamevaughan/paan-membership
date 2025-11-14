import React from "react";
import { Icon } from "@iconify/react";
import { components } from "react-select";

// Custom option component with icons
export const CustomOption = (props) => {
  const { data } = props;
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        {data.icon && <Icon icon={data.icon} className="w-4 h-4" />}
        <span>{data.label}</span>
      </div>
    </components.Option>
  );
};

// Custom single value component with icons
export const CustomSingleValue = (props) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        {data.icon && <Icon icon={data.icon} className="w-4 h-4" />}
        <span>{data.label}</span>
      </div>
    </components.SingleValue>
  );
};

// Sort options with icons
export const sortOptions = [
  { value: "recent", label: "Recently Added", icon: "mdi:clock-outline" },
  { value: "asc", label: "Ascending (A-Z)", icon: "mdi:sort-alphabetical-ascending" },
  { value: "desc", label: "Descending (Z-A)", icon: "mdi:sort-alphabetical-descending" },
  { value: "last_month", label: "Last Month", icon: "mdi:calendar-month" },
  { value: "last_7_days", label: "Last 7 Days", icon: "mdi:calendar-week" }
];

// Page size options
export const pageSizeOptions = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: -1, label: "All" }
];

// React Select custom styles based on mode
export const getSelectStyles = (mode) => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: mode === "dark" ? "#1f2937" : "#ffffff",
    borderColor: mode === "dark" ? "#4b5563" : "#d1d5db",
    color: mode === "dark" ? "#f3f4f6" : "#111827",
    minHeight: "38px",
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    "&:hover": {
      borderColor: mode === "dark" ? "#6b7280" : "#9ca3af",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: mode === "dark" ? "#1f2937" : "#ffffff",
    border: `1px solid ${mode === "dark" ? "#4b5563" : "#d1d5db"}`,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? mode === "dark"
        ? "#3b82f6"
        : "#3b82f6"
      : state.isFocused
      ? mode === "dark"
        ? "#374151"
        : "#f3f4f6"
      : mode === "dark"
      ? "#1f2937"
      : "#ffffff",
    color: state.isSelected
      ? "#ffffff"
      : mode === "dark"
      ? "#f3f4f6"
      : "#111827",
    cursor: "pointer",
    "&:active": {
      backgroundColor: mode === "dark" ? "#3b82f6" : "#3b82f6",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: mode === "dark" ? "#f3f4f6" : "#111827",
  }),
  input: (base) => ({
    ...base,
    color: mode === "dark" ? "#f3f4f6" : "#111827",
  }),
  placeholder: (base) => ({
    ...base,
    color: mode === "dark" ? "#9ca3af" : "#6b7280",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: mode === "dark" ? "#4b5563" : "#d1d5db",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: mode === "dark" ? "#9ca3af" : "#6b7280",
    "&:hover": {
      color: mode === "dark" ? "#f3f4f6" : "#111827",
    },
  }),
});