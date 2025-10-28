import React from "react";

// Helper function to detect and format monetary values
export const formatDisplayValue = (value, columnAccessor, columnHeader) => {
  if (value === null || value === undefined || value === '') return value;

  const accessor = columnAccessor?.toLowerCase() || '';
  const header = columnHeader?.toLowerCase() || '';
  
  // Currency field patterns
  const currencyPatterns = [
    'price', 'cost', 'amount', 'total', 'value', 'revenue', 'profit', 
    'expense', 'fee', 'charge', 'payment', 'salary', 'wage', 'budget',
    'balance', 'credit', 'debit', 'refund', 'discount', 'tax', 'subtotal',
    'grand_total', 'net_amount', 'gross_amount', 'order_value', 'sale_value',
    'purchase_value', 'suggested_order_value', 'current_stock_value'
  ];
  
  // Check if this is a currency field
  const isCurrencyField = currencyPatterns.some(pattern => 
    accessor.includes(pattern) || header.includes(pattern)
  );
  
  // Check if value looks like a monetary amount (number > 0.01 or contains decimal)
  const numValue = parseFloat(value);
  
  // Format as currency if it's a currency field or looks like money
  if (isCurrencyField && !isNaN(numValue)) {
    return formatCurrency(numValue);
  }
  
  // For other numeric values, add commas but no currency symbol
  if (!isNaN(numValue) && (numValue >= 1000 || String(value).includes('.'))) {
    return formatNumber(numValue, String(value).includes('.') ? 2 : 0);
  }
  
  return value;
};

// Function to check if a column has any non-empty data
export const hasColumnData = (accessor, render, safeData) => {
  if (!safeData || safeData.length === 0) return true; // Show all columns if no data

  return safeData.some((row) => {
    if (render) {
      // For columns with custom render functions, check the rendered value
      const renderedValue = render(row);
      if (React.isValidElement && React.isValidElement(renderedValue)) {
        // For React elements, check if it's not just a dash or empty
        return (
          renderedValue.props.children !== "-" &&
          renderedValue.props.children !== "" &&
          !renderedValue.props.className?.includes("text-gray-400")
        );
      }
      // For date columns, be more lenient - show even if some dates are invalid
      if (
        accessor === "timestamp" ||
        accessor === "created_at" ||
        accessor === "updated_at"
      ) {
        return renderedValue !== "-" && renderedValue !== "";
      }
      return renderedValue !== "-" && renderedValue !== "";
    }

    // For regular columns, check the actual value
    const value = row[accessor];
    return (
      value !== null && value !== undefined && value !== "" && value !== 0
    );
  });
};

// Function to automatically determine the best status context
export const getAutoStatusContext = (column, data, customStatusContexts, statusContext) => {
  const columnName = column.accessor.toLowerCase();
  const headerName = column.Header?.toLowerCase() || "";

  // Check custom status contexts first
  if (customStatusContexts[column.accessor]) {
    return customStatusContexts[column.accessor];
  }

  // Check for specific patterns in column names
  if (
    columnName.includes("stock") ||
    columnName.includes("inventory") ||
    headerName.includes("stock") ||
    headerName.includes("inventory")
  ) {
    return "inventory";
  }

  if (
    columnName.includes("payment") ||
    columnName.includes("paid") ||
    headerName.includes("payment") ||
    headerName.includes("paid")
  ) {
    return "payment";
  }

  if (
    columnName.includes("user") ||
    columnName.includes("account") ||
    headerName.includes("user") ||
    headerName.includes("account")
  ) {
    return "user";
  }

  if (
    columnName.includes("order") ||
    columnName.includes("sale") ||
    headerName.includes("order") ||
    headerName.includes("sale")
  ) {
    return "sales";
  }

  if (
    columnName.includes("delivery") ||
    columnName.includes("shipping") ||
    headerName.includes("delivery") ||
    headerName.includes("shipping")
  ) {
    return "delivery";
  }

  // Check data patterns to infer context
  if (data.length > 0) {
    const sampleValues = data
      .slice(0, 10)
      .map((row) => row[column.accessor])
      .filter(Boolean);
    const uniqueValues = [
      ...new Set(sampleValues.map((v) => v.toString().toLowerCase())),
    ];

    // Check for sales-related values FIRST (higher priority for sales reports)
    if (
      uniqueValues.some((v) =>
        [
          "completed",
          "pending",
          "cancelled",
          "refunded",
          "processing",
          "hold",
          "layaway",
        ].includes(v)
      )
    ) {
      return "sales";
    }

    // Check for inventory-related values
    if (
      uniqueValues.some((v) =>
        ["in stock", "out of stock", "low stock", "discontinued"].includes(v)
      )
    ) {
      return "inventory";
    }

    // Check for payment-related values
    if (
      uniqueValues.some((v) =>
        ["paid", "unpaid", "partially paid", "overdue"].includes(v)
      )
    ) {
      return "payment";
    }

    // Check for user-related values LAST (lower priority)
    if (
      uniqueValues.some((v) =>
        ["active", "inactive", "suspended", "pending"].includes(v)
      )
    ) {
      return "user";
    }
  }

  // Default fallback
  return statusContext;
};

// Check if a field is a date field
export const isDateField = (accessor) => {
  return (
    accessor === "timestamp" ||
    accessor === "created_at" ||
    accessor === "updated_at" ||
    accessor === "deleted_at" ||
    accessor === "date" ||
    accessor === "order_date" ||
    accessor === "sale_date" ||
    accessor === "purchase_date" ||
    accessor === "due_date" ||
    accessor === "expiry_date" ||
    accessor === "start_date" ||
    accessor === "end_date" ||
    (accessor && accessor.toLowerCase().includes("date")) ||
    (accessor && accessor.toLowerCase().includes("time"))
  );
};

// Format date values
export const formatDateValue = (value) => {
  if (!value) return value;
  
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  } catch (e) {
    // Keep original value if date parsing fails
  }
  return value;
};