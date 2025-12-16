// backend/src/server.ts
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import telegramService from './services/telegram.service';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize Telegram bot
    await telegramService.initialize();

    const server = app.listen(PORT, () => {
      console.log(`
🚀 WedGram Backend Server Started!
-----------------------------------
✅ Port: ${PORT}
✅ Environment: ${process.env.NODE_ENV || 'development'}
✅ Health Check: http://localhost:${PORT}/health
✅ API Base: http://localhost:${PORT}/api/v1
-----------------------------------
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('Forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();