// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/database';
import { configureCloudinary } from './config/cloudinary';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { globalRateLimiter } from './middleware/rateLimit.middleware';
import routes from './routes';
import logger from './utils/logger';
import mongoose from 'mongoose';

const app = express();
// Trust proxy (IMPORTANT for Render/Heroku/Vercel)
app.set('trust proxy', 1); // Add this line

// Connect to database
connectDB().catch((err) => {
  logger.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Configure Cloudinary
configureCloudinary();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://wedgram.onrender.com',
    'http://localhost:3001',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Cache-Control', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

app.use((req, res, next) => {
  console.log('Request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    files: (req as any).files,
  });
  next();
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use(globalRateLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});



app.get('/api/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is working',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-wedding', async (req, res) => {
  try {
    const weddingCount = await mongoose.connection.db?.collection('weddings')?.countDocuments();
    res.json({
      status: 'ok',
      weddingCollectionExists: weddingCount !== undefined,
      weddingCount: weddingCount || 0
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.json({
      status: 'error',
      message: errorMessage
    });
  }
});

// Health check - THIS SHOULD BE /health (not /api/v1/health)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'WedGram Backend',
    version: '1.0.0',
  });
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to WedGram API',
    version: '1.0.0',
    documentation: 'https://github.com/ABREHAMonly/wedgram',
    endpoints: {
      auth: '/api/v1/auth',
      invites: '/api/v1/invites',
      rsvp: '/api/v1/rsvp',
      admin: '/api/v1/admin'
    },
    health: '/health'
  });
});

// API Routes
app.use('/api/v1', routes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;