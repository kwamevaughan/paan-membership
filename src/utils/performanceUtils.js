/**
 * Performance optimization utilities
 */

/**
 * Simple in-memory cache
 */
class Cache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value, customTTL = null) {
    const expiresAt = Date.now() + (customTTL || this.ttl);
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instances
export const queryCache = new Cache(60000); // 1 minute
export const dataCache = new Cache(300000); // 5 minutes

/**
 * Memoize function results
 */
export function memoize(fn, keyGenerator = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  
  return function memoized(...args) {
    const key = keyGenerator(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Debounce function calls
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  
  return function debounced(...args) {
    clearTimeout(timeoutId);
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(fn.apply(this, args));
      }, delay);
    });
  };
}

/**
 * Throttle function calls
 */
export function throttle(fn, limit = 300) {
  let inThrottle;
  
  return function throttled(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Batch multiple operations
 */
export class BatchProcessor {
  constructor(processFn, options = {}) {
    this.processFn = processFn;
    this.batchSize = options.batchSize || 10;
    this.delay = options.delay || 100;
    this.queue = [];
    this.processing = false;
    this.timeoutId = null;
  }

  add(item) {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });
      this.scheduleProcess();
    });
  }

  scheduleProcess() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.process();
    }, this.delay);
  }

  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      const items = batch.map(b => b.item);

      try {
        const results = await this.processFn(items);
        
        batch.forEach((b, index) => {
          b.resolve(results[index]);
        });
      } catch (error) {
        batch.forEach(b => {
          b.reject(error);
        });
      }
    }

    this.processing = false;
  }
}

/**
 * Lazy load data with pagination
 */
export class LazyLoader {
  constructor(fetchFn, options = {}) {
    this.fetchFn = fetchFn;
    this.pageSize = options.pageSize || 50;
    this.data = [];
    this.page = 0;
    this.hasMore = true;
    this.loading = false;
  }

  async loadMore() {
    if (this.loading || !this.hasMore) {
      return [];
    }

    this.loading = true;
    this.page++;

    try {
      const newData = await this.fetchFn(this.page, this.pageSize);
      
      if (newData.length < this.pageSize) {
        this.hasMore = false;
      }

      this.data.push(...newData);
      return newData;
    } finally {
      this.loading = false;
    }
  }

  reset() {
    this.data = [];
    this.page = 0;
    this.hasMore = true;
    this.loading = false;
  }
}

/**
 * Optimize database queries with caching
 */
export async function cachedQuery(key, queryFn, ttl = 60000) {
  // Check cache first
  const cached = queryCache.get(key);
  if (cached) {
    return cached;
  }

  // Execute query
  const result = await queryFn();

  // Cache result
  queryCache.set(key, result, ttl);

  return result;
}

/**
 * Prefetch data for better UX
 */
export function prefetch(url, options = {}) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = options.as || 'fetch';
  
  if (options.crossOrigin) {
    link.crossOrigin = options.crossOrigin;
  }

  document.head.appendChild(link);
}

/**
 * Optimize image loading
 */
export function optimizeImage(src, options = {}) {
  const {
    width,
    height,
    quality = 75,
    format = 'webp',
  } = options;

  // If using Next.js Image component, this is handled automatically
  // This is a placeholder for custom image optimization logic
  return {
    src,
    width,
    height,
    quality,
    format,
  };
}

/**
 * Measure performance
 */
export class PerformanceMonitor {
  constructor(name) {
    this.name = name;
    this.marks = new Map();
  }

  start(label = 'default') {
    const key = `${this.name}-${label}`;
    this.marks.set(label, performance.now());
    
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${key}-start`);
    }
  }

  end(label = 'default') {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark found for ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    const key = `${this.name}-${label}`;
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${key}-end`);
      performance.measure(key, `${key}-start`, `${key}-end`);
    }

    console.log(`[Performance] ${key}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  measure(label, fn) {
    this.start(label);
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => this.end(label));
    }
    
    this.end(label);
    return result;
  }
}

/**
 * Optimize React component rendering
 */
export function shouldComponentUpdate(prevProps, nextProps, keys = []) {
  if (keys.length === 0) {
    keys = Object.keys(nextProps);
  }

  return keys.some(key => prevProps[key] !== nextProps[key]);
}

/**
 * Virtual scrolling helper
 */
export function calculateVisibleRange(scrollTop, itemHeight, containerHeight, totalItems) {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  // Add buffer for smooth scrolling
  const buffer = 5;
  const bufferedStart = Math.max(0, startIndex - buffer);
  const bufferedEnd = Math.min(totalItems - 1, endIndex + buffer);

  return {
    startIndex: bufferedStart,
    endIndex: bufferedEnd,
    visibleItems: bufferedEnd - bufferedStart + 1,
  };
}

/**
 * Cleanup expired cache entries periodically
 */
if (typeof window !== 'undefined') {
  setInterval(() => {
    queryCache.cleanup();
    dataCache.cleanup();
  }, 60000); // Every minute
}
