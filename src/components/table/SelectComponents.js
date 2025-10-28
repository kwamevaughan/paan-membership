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