import { MiddlewareHandler } from "hono";

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

// Default rate limit configuration
const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: "Too many requests, please try again later."
};

// In-memory store for rate limiting (in production, use Redis or similar)
interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(ip => {
    if (rateLimitStore[ip].resetTime < now) {
      delete rateLimitStore[ip];
    }
  });
}, 60000); // Clean up every minute

// Get client IP address
const getClientIP = (c: any): string => {
  // Check for forwarded headers (when behind proxy)
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  // Check for real IP header
  const realIP = c.req.header("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection remote address
  return c.req.header("x-forwarded-for") || 
         c.req.header("x-real-ip") || 
         "unknown";
};

// Main rate limiter middleware
export const rateLimiter = (config: Partial<RateLimitConfig> = {}): MiddlewareHandler => {
  const finalConfig = { ...defaultConfig, ...config };
  
  return async (c, next) => {
    const clientIP = getClientIP(c);
    const now = Date.now();
    
    // Get or create rate limit entry for this IP
    if (!rateLimitStore[clientIP]) {
      rateLimitStore[clientIP] = {
        count: 0,
        resetTime: now + finalConfig.windowMs
      };
    }
    
    const entry = rateLimitStore[clientIP];
    
    // Check if window has reset
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + finalConfig.windowMs;
    }
    
    // Check if rate limit exceeded
    if (entry.count >= finalConfig.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return c.json({
        error: "Rate limit exceeded",
        message: finalConfig.message,
        retryAfter: retryAfter
      }, 429);
    }
    
    // Increment request count
    entry.count++;
    
    // Add rate limit headers to response
    c.header("X-RateLimit-Limit", finalConfig.maxRequests.toString());
    c.header("X-RateLimit-Remaining", (finalConfig.maxRequests - entry.count).toString());
    c.header("X-RateLimit-Reset", new Date(entry.resetTime).toISOString());
    
    await next();
  };
};

// Specific rate limiters for different endpoints
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: "Too many authentication attempts, please try again later."
});

export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // 1000 API requests per 15 minutes
  message: "API rate limit exceeded, please try again later."
});

export const strictRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: "Too many requests, please slow down."
});

// Utility function to get rate limit info for an IP
export const getRateLimitInfo = (ip: string) => {
  const entry = rateLimitStore[ip];
  if (!entry) {
    return {
      remaining: defaultConfig.maxRequests,
      resetTime: Date.now() + defaultConfig.windowMs,
      limit: defaultConfig.maxRequests
    };
  }
  
  const now = Date.now();
  if (now > entry.resetTime) {
    return {
      remaining: defaultConfig.maxRequests,
      resetTime: now + defaultConfig.windowMs,
      limit: defaultConfig.maxRequests
    };
  }
  
  return {
    remaining: Math.max(0, defaultConfig.maxRequests - entry.count),
    resetTime: entry.resetTime,
    limit: defaultConfig.maxRequests
  };
};









