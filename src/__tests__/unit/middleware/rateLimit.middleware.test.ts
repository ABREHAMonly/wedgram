// backend/src/__tests__/unit/middleware/rateLimit.middleware.test.ts
// Mock express-rate-limit
const mockRateLimit = jest.fn(() => jest.fn());

jest.mock('express-rate-limit', () => {
  return jest.fn(() => mockRateLimit);
});

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should call rateLimit to create middleware', () => {
    // Set environment variables
    process.env.RATE_LIMIT_WINDOW_MS = '900000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '100';
    
    // Require the module fresh
    require('../../../middleware/rateLimit.middleware');
    
    // Get the mocked rateLimit
    const rateLimit = require('express-rate-limit');
    
    // Should have been called at least once
    expect(rateLimit).toHaveBeenCalled();
  });

  it('should have exported middleware functions', () => {
    const { 
      globalRateLimiter, 
      authRateLimiter, 
      inviteRateLimiter 
    } = require('../../../middleware/rateLimit.middleware');
    
    // All should be functions (the mock middleware)
    expect(typeof globalRateLimiter).toBe('function');
    expect(typeof authRateLimiter).toBe('function');
    expect(typeof inviteRateLimiter).toBe('function');
  });
});