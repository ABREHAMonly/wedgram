// backend/src/__tests__/unit/middleware/rateLimit.middleware.test.ts
// Fix: Mock the module properly
const mockRateLimit = jest.fn();

jest.mock('express-rate-limit', () => {
  return jest.fn(() => mockRateLimit);
});

// Type the mock properly
const mockedRateLimit = jest.mocked(require('express-rate-limit'));

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear module cache
    jest.resetModules();
    
    // Reset the mock to return a new function each time
    mockRateLimit.mockReturnValue(jest.fn());
  });

  it('should create global rate limiter with correct settings', () => {
    // Set environment variables for the test
    process.env.RATE_LIMIT_WINDOW_MS = '900000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '100';
    
    jest.isolateModules(() => {
      // Require the module fresh
      require('../../../middleware/rateLimit.middleware');
      
      // Check that rateLimit was called
      expect(mockedRateLimit).toHaveBeenCalled();
      
      // Get the first call arguments
      const firstCall = mockedRateLimit.mock.calls[0];
      
      // Check the configuration
      const config = firstCall[0];
      expect(config.windowMs).toBe(900000);
      expect(config.max).toBe(100);
      expect(config.message).toContain('Too many requests');
      expect(config.standardHeaders).toBe(true);
      expect(config.legacyHeaders).toBe(false);
    });
  });

  it('should create auth rate limiter', () => {
    jest.isolateModules(() => {
      // Import fresh
      const { authRateLimiter } = require('../../../middleware/rateLimit.middleware');
      
      // Check it's defined
      expect(authRateLimiter).toBeDefined();
      
      // Should be a function (the mocked rate limit)
      expect(typeof authRateLimiter).toBe('function');
    });
  });

  it('should create invite rate limiter', () => {
    jest.isolateModules(() => {
      const { inviteRateLimiter } = require('../../../middleware/rateLimit.middleware');
      expect(inviteRateLimiter).toBeDefined();
      expect(typeof inviteRateLimiter).toBe('function');
    });
  });
});