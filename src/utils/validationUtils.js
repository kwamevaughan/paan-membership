/**
 * Validation utility functions for summit ticket management
 */

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  
  return { valid: true };
}

/**
 * Validate phone number
 */
export function validatePhone(phone) {
  if (!phone) {
    return { valid: false, error: "Phone number is required" };
  }
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < 10) {
    return { valid: false, error: "Phone number must be at least 10 digits" };
  }
  
  return { valid: true };
}

/**
 * Validate ticket type data
 */
export function validateTicketType(data) {
  const errors = {};
  
  if (!data.name || data.name.trim() === '') {
    errors.name = "Ticket name is required";
  }
  
  if (!data.category || data.category.trim() === '') {
    errors.category = "Category is required";
  }
  
  if (!data.price || parseFloat(data.price) <= 0) {
    errors.price = "Price must be greater than 0";
  }
  
  if (data.original_price && parseFloat(data.original_price) < parseFloat(data.price)) {
    errors.original_price = "Original price must be greater than or equal to current price";
  }
  
  if (!data.currency || data.currency.trim() === '') {
    errors.currency = "Currency is required";
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate promo code data
 */
export function validatePromoCode(data) {
  const errors = {};
  
  if (!data.code || data.code.trim() === '') {
    errors.code = "Promo code is required";
  } else if (!/^[A-Z0-9_-]+$/i.test(data.code)) {
    errors.code = "Promo code can only contain letters, numbers, hyphens, and underscores";
  }
  
  if (!data.discount_type || !['percentage', 'fixed'].includes(data.discount_type)) {
    errors.discount_type = "Discount type must be 'percentage' or 'fixed'";
  }
  
  if (!data.discount_value || parseFloat(data.discount_value) <= 0) {
    errors.discount_value = "Discount value must be greater than 0";
  }
  
  if (data.discount_type === 'percentage' && parseFloat(data.discount_value) > 100) {
    errors.discount_value = "Percentage discount cannot exceed 100%";
  }
  
  if (data.usage_limit && parseInt(data.usage_limit) < 0) {
    errors.usage_limit = "Usage limit cannot be negative";
  }
  
  if (data.valid_from && data.valid_until) {
    const from = new Date(data.valid_from);
    const until = new Date(data.valid_until);
    if (from >= until) {
      errors.valid_until = "Valid until date must be after valid from date";
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate purchaser data
 */
export function validatePurchaser(data) {
  const errors = {};
  
  if (!data.full_name || data.full_name.trim() === '') {
    errors.full_name = "Full name is required";
  }
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }
  
  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }
  
  if (!data.country || data.country.trim() === '') {
    errors.country = "Country is required";
  }
  
  if (data.visa_letter_needed) {
    if (!data.passport_number || data.passport_number.trim() === '') {
      errors.passport_number = "Passport number is required for visa letter";
    }
    if (!data.nationality || data.nationality.trim() === '') {
      errors.nationality = "Nationality is required for visa letter";
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate attendee data
 */
export function validateAttendee(data) {
  const errors = {};
  
  if (!data.full_name || data.full_name.trim() === '') {
    errors.full_name = "Full name is required";
  }
  
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }
  
  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.valid) {
      errors.phone = phoneValidation.error;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate purchase data
 */
export function validatePurchase(data) {
  const errors = {};
  
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.items = "At least one ticket must be selected";
  }
  
  if (!data.payment_method || data.payment_method.trim() === '') {
    errors.payment_method = "Payment method is required";
  }
  
  // Validate purchaser
  if (!data.purchaser) {
    errors.purchaser = "Purchaser information is required";
  } else {
    const purchaserValidation = validatePurchaser(data.purchaser);
    if (!purchaserValidation.valid) {
      errors.purchaser = purchaserValidation.errors;
    }
  }
  
  // Validate attendees
  if (data.attendees && Array.isArray(data.attendees)) {
    const attendeeErrors = [];
    data.attendees.forEach((attendee, index) => {
      const validation = validateAttendee(attendee);
      if (!validation.valid) {
        attendeeErrors[index] = validation.errors;
      }
    });
    if (attendeeErrors.length > 0) {
      errors.attendees = attendeeErrors;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate refund request
 */
export function validateRefund(data) {
  const errors = {};
  
  if (!data.reason || data.reason.trim() === '') {
    errors.reason = "Refund reason is required";
  }
  
  if (data.amount && parseFloat(data.amount) <= 0) {
    errors.amount = "Refund amount must be greater than 0";
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(str) {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Sanitize object data
 */
export function sanitizeData(data) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors) {
  if (typeof errors === 'string') {
    return errors;
  }
  
  if (Array.isArray(errors)) {
    return errors.join(', ');
  }
  
  if (typeof errors === 'object') {
    return Object.entries(errors)
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}: ${formatValidationErrors(value)}`;
        }
        return `${key}: ${value}`;
      })
      .join('; ');
  }
  
  return 'Validation error';
}
