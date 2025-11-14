/**
 * API Response Formatter Utilities
 * Standardized response formatting for API endpoints
 */

/**
 * Format successful API response
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @param {Object} meta - Optional metadata (pagination, etc.)
 * @returns {Object} Formatted success response
 */
export function formatSuccessResponse(data, message = null, meta = null) {
  const response = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
}

/**
 * Format error API response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Optional error details
 * @returns {Object} Formatted error response
 */
export function formatErrorResponse(message, statusCode = 500, details = null) {
  const response = {
    success: false,
    error: {
      message,
      statusCode,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return response;
}

/**
 * Format paginated response
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination info
 * @returns {Object} Formatted paginated response
 */
export function formatPaginatedResponse(data, pagination) {
  return formatSuccessResponse(data, null, {
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalCount: pagination.totalCount,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPreviousPage: pagination.page > 1,
    },
  });
}

/**
 * Send success response
 * @param {Object} res - Next.js response object
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Optional success message
 * @param {Object} meta - Optional metadata
 */
export function sendSuccess(res, data, statusCode = 200, message = null, meta = null) {
  return res.status(statusCode).json(formatSuccessResponse(data, message, meta));
}

/**
 * Send error response
 * @param {Object} res - Next.js response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Optional error details
 */
export function sendError(res, message, statusCode = 500, details = null) {
  return res.status(statusCode).json(formatErrorResponse(message, statusCode, details));
}

/**
 * Send paginated response
 * @param {Object} res - Next.js response object
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination info
 * @param {number} statusCode - HTTP status code
 */
export function sendPaginatedResponse(res, data, pagination, statusCode = 200) {
  return res.status(statusCode).json(formatPaginatedResponse(data, pagination));
}

/**
 * Handle API errors consistently
 * @param {Object} res - Next.js response object
 * @param {Error} error - Error object
 * @param {string} context - Error context for logging
 */
export function handleApiError(res, error, context = "API") {
  console.error(`[${context}] Error:`, error);

  // Handle specific error types
  if (error.code === "PGRST116") {
    return sendError(res, "Resource not found", 404);
  }

  if (error.code === "23505") {
    return sendError(res, "Duplicate entry", 409, { code: error.code });
  }

  if (error.code === "23503") {
    return sendError(res, "Referenced resource not found", 404, { code: error.code });
  }

  // Default error response
  return sendError(
    res,
    error.message || "Internal server error",
    error.statusCode || 500,
    process.env.NODE_ENV === "development" ? { stack: error.stack } : null
  );
}

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
export function validateRequiredFields(body, requiredFields) {
  const missingFields = requiredFields.filter((field) => !body[field]);

  if (missingFields.length > 0) {
    return {
      valid: false,
      message: "Missing required fields",
      fields: missingFields,
    };
  }

  return { valid: true };
}

/**
 * Validate request method
 * @param {Object} req - Next.js request object
 * @param {Array<string>} allowedMethods - Array of allowed HTTP methods
 * @returns {boolean} Whether method is allowed
 */
export function validateMethod(req, allowedMethods) {
  return allowedMethods.includes(req.method);
}

/**
 * Send method not allowed response
 * @param {Object} res - Next.js response object
 * @param {Array<string>} allowedMethods - Array of allowed HTTP methods
 */
export function sendMethodNotAllowed(res, allowedMethods) {
  res.setHeader("Allow", allowedMethods.join(", "));
  return sendError(res, `Method ${allowedMethods.join(", ")} allowed`, 405);
}
