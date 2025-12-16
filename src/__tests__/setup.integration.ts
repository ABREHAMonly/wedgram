// backend/src/__tests__/setup.integration.ts
 
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Increase timeout for all tests
jest.setTimeout(60000);

beforeAll(async () => {
  try {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 60000,
      }
    });
    const mongoUri = mongoServer.getUri();
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    
    console.log('✅ Integration Test MongoDB connected');
    
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-jwt-secret-key-change-this';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.PORT = '5000';
    
  } catch (error) {
    console.error('Failed to setup integration test database:', error);
    throw error;
  }
});

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



// Global beforeEach - runs before each test
beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
    } catch {
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