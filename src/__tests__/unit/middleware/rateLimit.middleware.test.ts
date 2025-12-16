// backend/src/__tests__/unit/middleware/rateLimit.middleware.test.ts
import rateLimit from 'express-rate-limit';

// Mock the rate limit module
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation((options) => {
    return jest.fn();
  });
});

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create global rate limiter with correct settings', () => {
    // We need to require the module after setting up the mock
    jest.isolateModules(() => {
      const { globalRateLimiter } = require('../../../middleware/rateLimit.middleware');
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 900000, // 15 minutes
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
      const { authRateLimiter } = require('../../../middleware/rateLimit.middleware');
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 15 * 60 * 1000,
          max: 5,
          message: 'Too many login attempts, please try again later.',
          standardHeaders: true,
          legacyHeaders: false,
        })
      );
    });
  });

  it('should create invite rate limiter with correct settings', () => {
    jest.isolateModules(() => {
      const { inviteRateLimiter } = require('../../../middleware/rateLimit.middleware');
      expect(rateLimit).toHaveBeenCalledWith(
        expect.objectContaining({
          windowMs: 60 * 60 * 1000,
          max: 50,
          message: 'Too many invitations sent, please try again later.',
          standardHeaders: true,
          legacyHeaders: false,
        })
      );
    });
  });
});