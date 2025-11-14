/**
 * Security utility functions for API routes and data handling
 */

/**
 * Rate limiting store (in-memory for simplicity)
 * In production, use Redis or similar
 */
const rateLimitStore = new Map();

/**
 * Simple rate limiter
 * @param {string} identifier - Unique identifier (e.g., IP address or user ID)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {object} { allowed: boolean, remaining: number, resetAt: Date }
 */
export function rateLimit(identifier, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  const key = `${identifier}`;
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetAt) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    cleanupRateLimitStore();
  }
  
  return {
    allowed: entry.count <= maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Verify admin role
 */
export async function verifyAdminRole(supabase, userId) {
  try {
    const { data: hrUser, error } = await supabase
      .from("hr_users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !hrUser) {
      return { authorized: false, error: "User not found" };
    }

    if (hrUser.role !== "admin") {
      return { authorized: false, error: "Insufficient permissions" };
    }

    return { authorized: true };
  } catch (error) {
    console.error("Error verifying admin role:", error);
    return { authorized: false, error: "Authorization check failed" };
  }
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  return obj;
}

/**
 * Validate CSRF token (placeholder - implement based on your CSRF strategy)
 */
export function validateCSRFToken(req, token) {
  // In a real implementation, verify the token against a stored value
  // This is a placeholder that should be replaced with actual CSRF validation
  const storedToken = req.cookies?.csrfToken;
  return token === storedToken;
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validate request origin
 */
export function validateOrigin(req, allowedOrigins = []) {
  const origin = req.headers.origin || req.headers.referer;
  
  if (!origin) {
    // Allow requests without origin (e.g., same-origin requests)
    return true;
  }
  
  // Check if origin is in allowed list
  return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

/**
 * Check if request is from allowed domain
 */
export function isAllowedDomain(req) {
  const allowedDomains = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean);
  
  return validateOrigin(req, allowedDomains);
}

/**
 * Middleware to apply rate limiting
 */
export function withRateLimit(handler, options = {}) {
  const {
    maxRequests = 100,
    windowMs = 60000,
    keyGenerator = (req) => getClientIP(req),
  } = options;
  
  return async (req, res) => {
    const identifier = keyGenerator(req);
    const { allowed, remaining, resetAt } = rateLimit(identifier, maxRequests, windowMs);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetAt.toISOString());
    
    if (!allowed) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: resetAt,
      });
    }
    
    return handler(req, res);
  };
}

/**
 * Middleware to verify admin role
 */
export function withAdminAuth(handler) {
  return async (req, res) => {
    try {
      const { createSupabaseServerClient } = await import("@/lib/supabaseServer");
      const supabase = createSupabaseServerClient(req, res);
      
      // Verify authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Verify admin role
      const { authorized, error } = await verifyAdminRole(supabase, user.id);
      
      if (!authorized) {
        return res.status(403).json({ error: error || "Forbidden" });
      }
      
      // Attach user to request
      req.user = user;
      req.supabase = supabase;
      
      return handler(req, res);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}

/**
 * Middleware to sanitize request body
 */
export function withSanitization(handler) {
  return async (req, res) => {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    return handler(req, res);
  };
}

/**
 * Combine multiple middleware functions
 */
export function compose(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * Secure API handler with all security measures
 */
export function secureAPIHandler(handler, options = {}) {
  const {
    requireAdmin = true,
    rateLimit: rateLimitOptions = {},
    sanitize = true,
  } = options;
  
  const middlewares = [];
  
  if (sanitize) {
    middlewares.push(withSanitization);
  }
  
  if (Object.keys(rateLimitOptions).length > 0) {
    middlewares.push((h) => withRateLimit(h, rateLimitOptions));
  }
  
  if (requireAdmin) {
    middlewares.push(withAdminAuth);
  }
  
  return compose(...middlewares)(handler);
}

/**
 * Validate and sanitize pagination parameters
 */
export function sanitizePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 50));
  
  return { page, limit };
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data) {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'api_key',
    'credit_card',
    'ssn',
    'passport_number',
  ];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }
  
  const masked = { ...data };
  for (const [key, value] of Object.entries(masked)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      masked[key] = '***REDACTED***';
    } else if (typeof value === 'object') {
      masked[key] = maskSensitiveData(value);
    }
  }
  
  return masked;
}
