// Simple in-memory rate limiter
// In production, use Redis or a dedicated rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number
    lastReset: number
  }
}

const store: RateLimitStore = {}

// Rate limit configuration
const RATE_LIMITS = {
  // General API calls
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  },
  
  // Voice practice sessions (more lenient)
  voice: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  },
  
  // Quiz sessions
  quiz: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50
  },
  
  // Progress updates
  progress: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30
  },
  
  // Settings updates
  settings: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20
  }
}

export interface RateLimitResult {
  success: boolean
  remaining?: number
  retryAfter?: number
}

export async function rateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'default'
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[type]
  const now = Date.now()
  const key = `${type}:${identifier}`
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupOldEntries()
  }
  
  // Get or create entry
  if (!store[key]) {
    store[key] = {
      count: 0,
      lastReset: now
    }
  }
  
  const entry = store[key]
  
  // Reset if window has expired
  if (now - entry.lastReset > config.windowMs) {
    entry.count = 0
    entry.lastReset = now
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((config.windowMs - (now - entry.lastReset)) / 1000)
    return {
      success: false,
      remaining: 0,
      retryAfter
    }
  }
  
  // Increment counter
  entry.count++
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count
  }
}

// Cleanup old entries to prevent memory leaks
function cleanupOldEntries() {
  const now = Date.now()
  const maxAge = Math.max(...Object.values(RATE_LIMITS).map(config => config.windowMs))
  
  for (const [key, entry] of Object.entries(store)) {
    if (now - entry.lastReset > maxAge) {
      delete store[key]
    }
  }
}

// Get rate limit status without incrementing
export function getRateLimitStatus(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'default'
): RateLimitResult {
  const config = RATE_LIMITS[type]
  const now = Date.now()
  const key = `${type}:${identifier}`
  
  if (!store[key]) {
    return {
      success: true,
      remaining: config.maxRequests
    }
  }
  
  const entry = store[key]
  
  // Check if window has expired
  if (now - entry.lastReset > config.windowMs) {
    return {
      success: true,
      remaining: config.maxRequests
    }
  }
  
  // Check current status
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((config.windowMs - (now - entry.lastReset)) / 1000)
    return {
      success: false,
      remaining: 0,
      retryAfter
    }
  }
  
  return {
    success: true,
    remaining: config.maxRequests - entry.count
  }
}

// Reset rate limit for a specific identifier
export function resetRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'default'
): void {
  const key = `${type}:${identifier}`
  delete store[key]
}

// Get all rate limit entries (for debugging)
export function getAllRateLimits(): RateLimitStore {
  return { ...store }
}

// Clear all rate limit entries
export function clearAllRateLimits(): void {
  for (const key of Object.keys(store)) {
    delete store[key]
  }
}