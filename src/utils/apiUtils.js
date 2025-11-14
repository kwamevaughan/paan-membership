/**
 * API utility functions with error handling and retry logic
 */

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Fetch with retry logic
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @param {number} retries - Number of retries (default: 2)
 * @param {number} delay - Delay between retries in ms (default: 1000)
 */
export async function fetchWithRetry(url, options = {}, retries = 2, delay = 1000) {
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      // Parse response
      const data = await response.json();
      
      // Handle error responses
      if (!response.ok) {
        throw new APIError(
          data.error || data.message || 'Request failed',
          response.status,
          data
        );
      }
      
      return data;
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      // If this was the last retry, throw the error
      if (i === retries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  
  throw lastError;
}

/**
 * GET request with error handling
 */
export async function apiGet(url, options = {}) {
  return fetchWithRetry(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request with error handling
 */
export async function apiPost(url, data, options = {}) {
  return fetchWithRetry(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request with error handling
 */
export async function apiPatch(url, data, options = {}) {
  return fetchWithRetry(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request with error handling
 */
export async function apiDelete(url, options = {}) {
  return fetchWithRetry(url, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * Handle API errors and return user-friendly messages
 */
export function handleAPIError(error) {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    // Handle specific status codes
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return error.message || 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  
  // Handle network errors
  if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
    return 'Network error. Please check your connection.';
  }
  
  // Handle timeout errors
  if (error.name === 'AbortError') {
    return 'Request timed out. Please try again.';
  }
  
  // Default error message
  return error.message || 'An unexpected error occurred.';
}

/**
 * Validate response data structure
 */
export function validateResponse(data, expectedFields = []) {
  if (!data) {
    throw new Error('No data received from server');
  }
  
  if (expectedFields.length > 0) {
    const missingFields = expectedFields.filter(field => !(field in data));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }
  
  return true;
}

/**
 * Create abort controller with timeout
 */
export function createAbortController(timeoutMs = 30000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  return {
    controller,
    cleanup: () => clearTimeout(timeout),
  };
}

/**
 * Batch API requests with concurrency limit
 */
export async function batchRequests(requests, concurrency = 5) {
  const results = [];
  const executing = [];
  
  for (const request of requests) {
    const promise = request().then(result => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });
    
    results.push(promise);
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

/**
 * Format error for toast notification
 */
export function formatErrorForToast(error) {
  const message = handleAPIError(error);
  
  return {
    message,
    duration: 5000,
    icon: '❌',
  };
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error) {
  if (error instanceof APIError) {
    // Retry on server errors and rate limits
    return error.status >= 500 || error.status === 429;
  }
  
  // Retry on network errors
  if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
    return true;
  }
  
  return false;
}
