/**
 * Request Rate Limiter
 * Prevents overloading AI providers with too many concurrent requests
 */

export class RateLimiter {
  constructor(maxRequests = 5, windowMs = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if request is allowed
   */
  isAllowed() {
    const now = Date.now();
    const recentRequests = this.requests.filter((time) => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);

    // Cleanup old requests
    this.requests = recentRequests;

    return true;
  }

  /**
   * Get wait time if rate limited
   */
  getWaitTime() {
    const now = Date.now();
    if (this.requests.length === 0) return 0;

    const oldestRequest = this.requests[0];
    const waitTime = this.windowMs - (now - oldestRequest);

    return Math.max(0, waitTime);
  }

  /**
   * Reset rate limiter
   */
  reset() {
    this.requests = [];
  }
}

export const apiRateLimiter = new RateLimiter(10, 1000); // 10 requests per second
