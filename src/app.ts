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

// Trust proxy for Render/Heroku/Vercel
app.set('trust proxy', 1);

// Connect to database
connectDB().catch((err) => {
  logger.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Configure Cloudinary
configureCloudinary();

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://wedgram.onrender.com',
  'https://your-frontend-domain.vercel.app',
  'http://localhost:3001',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
    'Cache-Control', // ADDED: Allow Cache-Control header
    'Origin',
    'X-Requested-With',
    'X-Request-Id',
  ],
  exposedHeaders: [
    'Content-Length',
    'X-Request-Id',
    'Content-Range',
    'X-Total-Count',
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Security middleware with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  },
}));

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use(globalRateLimiter);

// Request logging middleware (simplified)
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log after response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Test endpoints
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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'WedGram Backend',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
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