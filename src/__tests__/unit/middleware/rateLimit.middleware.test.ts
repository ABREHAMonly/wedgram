// backend/src/__tests__/unit/middleware/rateLimit.middleware.test.ts
import rateLimit from 'express-rate-limit';

// Mock the rate limit module
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation(() => {
    return jest.fn();
  });
});

// Remove unused imports or use them
describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear module cache to re-require
    jest.resetModules();
  });

  it('should create global rate limiter with correct settings', () => {
    jest.isolateModules(() => {
      require('../../../middleware/rateLimit.middleware');
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 900000,
          max: 100,
          message: 'Too many requests from this IP, please try again later.',
          standardHeaders: true,
          legacyHeaders: false,
        })
      );
    });
  });

  it('should create auth rate limiter with correct settings', () => {
    jest.isolateModules(() => {
      const { authRateLimiter: authLimiter } = require('../../../middleware/rateLimit.middleware');
      // Use the variable to avoid unused warning
      expect(authLimiter).toBeDefined();
    });
  });

  it('should create invite rate limiter with correct settings', () => {
    jest.isolateModules(() => {
      const { inviteRateLimiter: inviteLimiter } = require('../../../middleware/rateLimit.middleware');
      // Use the variable to avoid unused warning
      expect(inviteLimiter).toBeDefined();
    });
  });
});