// backend/src/__tests__/setup.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

let mongoServer: MongoMemoryServer;

// Increase timeout for all tests
jest.setTimeout(60000); // Increase from 30000 to 60000

beforeAll(async () => {
  try {
    // Setup in-memory MongoDB with longer timeout
    mongoServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 60000, // Increase launch timeout
      }
    });
    const mongoUri = mongoServer.getUri();
    
    // Clear any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Test MongoDB connected to:', mongoUri);
    
    // Mock environment variables
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5000';
    process.env.BASE_URL = 'http://localhost:3000';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.INVITE_BASE_URL = 'http://localhost:3000/invite';
    
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
  
  // Mock external services for integration tests
  jest.mock('../services/email.service', () => ({
    EmailService: jest.fn().mockImplementation(() => ({
      sendInvitation: jest.fn().mockResolvedValue(true),
      sendEmail: jest.fn().mockResolvedValue(true),
      isConfigured: jest.fn().mockReturnValue(true),
    })),
    default: {
      sendInvitation: jest.fn().mockResolvedValue(true),
      sendEmail: jest.fn().mockResolvedValue(true),
      isConfigured: jest.fn().mockReturnValue(true),
    }
  }));

  jest.mock('../services/telegram.service', () => ({
    sendInvitation: jest.fn().mockResolvedValue(true),
    isBotActive: jest.fn().mockReturnValue(true),
    initialize: jest.fn().mockResolvedValue(undefined),
    default: {
      sendInvitation: jest.fn().mockResolvedValue(true),
      isBotActive: jest.fn().mockReturnValue(true),
      initialize: jest.fn().mockResolvedValue(undefined),
    }
  }));

  jest.mock('../services/cloudinary.service', () => ({
    uploadImage: jest.fn().mockResolvedValue('https://cloudinary.com/test-image.jpg'),
    deleteImage: jest.fn().mockResolvedValue(undefined),
    default: {
      uploadImage: jest.fn().mockResolvedValue('https://cloudinary.com/test-image.jpg'),
      deleteImage: jest.fn().mockResolvedValue(undefined),
    }
  }));

  // Mock logger
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
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Close connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  // Clear mocks
  jest.clearAllMocks();
});

// Helper functions for tests
export const generateTestToken = (userId: string, role: string = 'inviter'): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
};

export const getAuthHeader = (token: string): string => {
  return `Bearer ${token}`;
};