// backend/src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import telegramService from './services/telegram.service';
import logger from './utils/logger';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize Telegram bot
    await telegramService.initialize();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`📝 Log level: ${process.env.LOG_LEVEL || 'info'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();