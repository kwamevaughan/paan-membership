/**
 * Export utility functions for CSV and Excel exports
 */

/**
 * Convert data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} fields - Array of field configurations {key, label}
 * @returns {string} CSV string
 */
export function convertToCSV(data, fields) {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headers = fields.map(f => f.label || f.key).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return fields.map(field => {
      let value = getNestedValue(item, field.key);
      
      // Apply formatter if provided
      if (field.formatter && typeof field.formatter === 'function') {
        value = field.formatter(value, item);
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Convert to string and escape
      value = String(value);
      
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    }).join(',');
  });
  
  return [headers, ...rows].join('\n');
}

/**
 * Get nested object value by dot notation path
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot notation path (e.g., 'user.name')
 * @returns {*} Value at path
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Filename without extension
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV
 * @param {Array} data - Data to export
 * @param {Array} fields - Field configurations
 * @param {string} filename - Filename without extension
 */
export function exportToCSV(data, fields, filename) {
  const csv = convertToCSV(data, fields);
  downloadCSV(csv, filename);
}

/**
 * Convert data to Excel-compatible format (TSV)
 * @param {Array} data - Array of objects to export
 * @param {Array} fields - Array of field configurations
 * @returns {string} TSV string
 */
export function convertToExcel(data, fields) {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headers = fields.map(f => f.label || f.key).join('\t');
  
  // Create data rows
  const rows = data.map(item => {
    return fields.map(field => {
      let value = getNestedValue(item, field.key);
      
      // Apply formatter if provided
      if (field.formatter && typeof field.formatter === 'function') {
        value = field.formatter(value, item);
      }
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Convert to string and clean
      value = String(value).replace(/\t/g, ' ').replace(/\n/g, ' ');
      
      return value;
    }).join('\t');
  });
  
  return [headers, ...rows].join('\n');
}

/**
 * Download Excel file
 * @param {string} content - TSV content string
 * @param {string} filename - Filename without extension
 */
export function downloadExcel(content, filename) {
  const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export data to Excel
 * @param {Array} data - Data to export
 * @param {Array} fields - Field configurations
 * @param {string} filename - Filename without extension
 */
export function exportToExcel(data, fields, filename) {
  const content = convertToExcel(data, fields);
  downloadExcel(content, filename);
}

/**
 * Common field formatters
 */
export const formatters = {
  date: (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
  },
  
  datetime: (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString();
  },
  
  currency: (value, currency = 'USD') => {
    if (!value) return '0.00';
    return `${currency} ${parseFloat(value).toFixed(2)}`;
  },
  
  boolean: (value) => {
    return value ? 'Yes' : 'No';
  },
  
  array: (value) => {
    if (!Array.isArray(value)) return '';
    return value.join(', ');
  },
  
  json: (value) => {
    if (!value) return '';
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  },
};

/**
 * Predefined field configurations for common exports
 */
export const exportFields = {
  purchases: [
    { key: 'id', label: 'Purchase ID' },
    { key: 'purchaser.full_name', label: 'Purchaser Name' },
    { key: 'purchaser.email', label: 'Email' },
    { key: 'purchaser.phone', label: 'Phone' },
    { key: 'purchaser.organization', label: 'Organization' },
    { key: 'purchaser.country', label: 'Country' },
    { key: 'total_amount', label: 'Total Amount', formatter: (v, item) => formatters.currency(v, item.currency) },
    { key: 'discount_amount', label: 'Discount', formatter: (v, item) => formatters.currency(v, item.currency) },
    { key: 'final_amount', label: 'Final Amount', formatter: (v, item) => formatters.currency(v, item.currency) },
    { key: 'promo_code', label: 'Promo Code' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'payment_status', label: 'Payment Status' },
    { key: 'status', label: 'Order Status' },
    { key: 'created_at', label: 'Purchase Date', formatter: formatters.datetime },
    { key: 'paid_at', label: 'Paid Date', formatter: formatters.datetime },
  ],
  
  attendees: [
    { key: 'id', label: 'Attendee ID' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'organization', label: 'Organization' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'ticket_type', label: 'Ticket Type' },
    { key: 'purchase_id', label: 'Purchase ID' },
    { key: 'purchaser.full_name', label: 'Purchaser Name' },
    { key: 'purchaser.email', label: 'Purchaser Email' },
    { key: 'dietary_requirements', label: 'Dietary Requirements' },
    { key: 'special_needs', label: 'Special Needs' },
    { key: 'created_at', label: 'Registration Date', formatter: formatters.date },
  ],
  
  attendeesVisa: [
    { key: 'id', label: 'Attendee ID' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'organization', label: 'Organization' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'purchaser.passport_number', label: 'Passport Number' },
    { key: 'purchaser.nationality', label: 'Nationality' },
    { key: 'purchaser.country', label: 'Country of Residence' },
    { key: 'ticket_type', label: 'Ticket Type' },
    { key: 'purchase.payment_status', label: 'Payment Status' },
    { key: 'created_at', label: 'Registration Date', formatter: formatters.date },
  ],
  
  ticketTypes: [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Ticket Name' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price', formatter: (v, item) => formatters.currency(v, item.currency) },
    { key: 'original_price', label: 'Original Price', formatter: (v, item) => formatters.currency(v, item.currency) },
    { key: 'currency', label: 'Currency' },
    { key: 'features', label: 'Features', formatter: formatters.json },
    { key: 'is_active', label: 'Active', formatter: formatters.boolean },
    { key: 'created_at', label: 'Created Date', formatter: formatters.date },
  ],
  
  promoCodes: [
    { key: 'id', label: 'ID' },
    { key: 'code', label: 'Code' },
    { key: 'description', label: 'Description' },
    { key: 'discount_type', label: 'Discount Type' },
    { key: 'discount_value', label: 'Discount Value' },
    { key: 'usage_limit', label: 'Usage Limit' },
    { key: 'used_count', label: 'Times Used' },
    { key: 'valid_from', label: 'Valid From', formatter: formatters.date },
    { key: 'valid_until', label: 'Valid Until', formatter: formatters.date },
    { key: 'is_active', label: 'Active', formatter: formatters.boolean },
    { key: 'created_at', label: 'Created Date', formatter: formatters.date },
  ],
  
  payments: [
    { key: 'id', label: 'Transaction ID' },
    { key: 'purchase_id', label: 'Purchase ID' },
    { key: 'amount', label: 'Amount', formatter: (v, item) => formatters.currency(v, item.currency) },
    { key: 'currency', label: 'Currency' },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'payment_gateway', label: 'Gateway' },
    { key: 'status', label: 'Status' },
    { key: 'gateway_transaction_id', label: 'Gateway Transaction ID' },
    { key: 'gateway_response', label: 'Gateway Response', formatter: formatters.json },
    { key: 'created_at', label: 'Transaction Date', formatter: formatters.datetime },
    { key: 'completed_at', label: 'Completed Date', formatter: formatters.datetime },
  ],
};
