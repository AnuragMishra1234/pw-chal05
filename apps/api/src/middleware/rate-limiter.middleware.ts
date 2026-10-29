import { Request, Response, NextFunction } from 'express';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipInTests?: boolean;
}

interface RequestRecord {
  timestamps: number[];
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.'
  } = options;

  const store = new Map<string, RequestRecord>();

  // Periodic cleanup every 5 minutes to release stale records
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter(t => now - t < windowMs);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 300000);

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    // In test or development environments, only enforce when x-test-rate-limit is true,
    // or when running in true production mode.
    const isProd = process.env.NODE_ENV === 'production';
    const isExplicitTest = req.headers['x-test-rate-limit'] === 'true';

    if (!isProd && !isExplicitTest) {
      return next();
    }

    const clientKey = (req.user?.id) || req.ip || req.socket.remoteAddress || 'anonymous';
    const now = Date.now();

    let record = store.get(clientKey);
    if (!record) {
      record = { timestamps: [] };
      store.set(clientKey, record);
    }

    // Filter to requests within current window
    record.timestamps = record.timestamps.filter(t => now - t < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));

      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((oldest + windowMs) / 1000));

      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfterSeconds,
          timestamp: new Date().toISOString()
        }
      });
    }

    record.timestamps.push(now);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.timestamps.length));

    next();
  };
}

/**
 * 5 requests per minute for GenAI generation endpoints.
 */
export const aiGenerationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'GenAI planning rate limit exceeded. You can generate or revise a maximum of 5 plans per minute.'
});

/**
 * 100 requests per minute for general API traffic.
 */
export const generalApiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'General API rate limit exceeded. Please throttle your requests.'
});
