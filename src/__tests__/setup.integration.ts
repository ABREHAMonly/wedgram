// backend/src/__tests__/setup.integration.ts
 
// This tells ESLint that jest is a global variable
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock all external services globally
jest.mock('../services/email.service', () => {
  const mockSendInvitation = jest.fn().mockResolvedValue(true);
  const mockIsConfigured = jest.fn().mockReturnValue(true);
  const mockSendEmail = jest.fn().mockResolvedValue(true);
  
  return {
    EmailService: jest.fn().mockImplementation(() => ({
      sendInvitation: mockSendInvitation,
      sendEmail: mockSendEmail,
      isConfigured: mockIsConfigured,
    })),
    default: {
      sendInvitation: mockSendInvitation,
      sendEmail: mockSendEmail,
      isConfigured: mockIsConfigured,
    }
  };
});

jest.mock('../services/telegram.service', () => ({
  default: {
    sendInvitation: jest.fn().mockResolvedValue(true),
    isBotActive: jest.fn().mockReturnValue(true),
    initialize: jest.fn().mockResolvedValue(undefined),
  }
}));

// Mock logger to reduce noise
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}));

// Global beforeAll - runs once for all integration tests
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-change-this';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.PORT = '5000';
  
  // Setup in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to MongoDB
  await mongoose.connect(mongoUri);
  
  // Allowed in test files
  console.log('✅ Test MongoDB connected');
});

// Global beforeEach - runs before each test
beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
    } catch (error) {
      // Collection might not exist - ignore error
    }
  }
});

// Global afterAll - runs after all tests
afterAll(async () => {
  // Close connections
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});