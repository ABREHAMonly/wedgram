// backend/src/config/database.ts
import mongoose from 'mongoose';
import logger from '../utils/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

export const connectDB = async (retryCount = 0): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  // In test environment, don't try to connect to real DB
  if (process.env.NODE_ENV === 'test') {
    logger.info('Test environment - skipping database connection');
    return;
  }

  if (!mongoUri) {
    logger.error('❌ MONGO_URI not found in environment variables.');
    // Don't exit in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw new Error('MONGO_URI not found in environment variables.');
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    logger.info('✅ MongoDB connected successfully!');
    
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error instanceof Error ? error.message : error}`);
    
    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying connection in ${RETRY_DELAY / 1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY);
    } else {
      logger.error('Maximum retry attempts reached. Exiting...');
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
      throw error;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
};