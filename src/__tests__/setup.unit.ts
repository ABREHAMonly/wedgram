// backend/src/__tests__/setup.unit.ts
// Unit tests don't need database connection
// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';
process.env.PORT = '5000';
process.env.BASE_URL = 'http://localhost:3000';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.INVITE_BASE_URL = 'http://localhost:3000/invite';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'testpass';

// No need for global mock functions - we'll mock in each test file

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.clearAllMocks();
});

// Helper functions for tests
export const generateTestToken = (userId: string, role: string = 'inviter'): string => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
};

export const getAuthHeader = (token: string): string => {
  return `Bearer ${token}`;
};