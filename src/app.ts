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

// ========== CORS CONFIGURATION ==========
const allowedOrigins = [
  'http://localhost:3000',
  'https://wedgram.onrender.com',
  'http://localhost:3001',
];

// Custom CORS middleware to handle preflight properly
const corsMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    // Allow all origins in development for easier testing
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Cache-Control, Origin, X-Request-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-Request-Id');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

// Apply custom CORS middleware
app.use(corsMiddleware);

// Also use the cors package for additional support
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Cache-Control', 'Origin', 'X-Request-Id'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ========== SECURITY MIDDLEWARE ==========
app.use(helmet({
  // Disable contentSecurityPolicy for API endpoints
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

// ========== REQUEST PARSING ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ========== RATE LIMITING ==========
// Skip rate limiting for OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    next();
  } else {
    globalRateLimiter(req, res, next);
  }
});

// ========== REQUEST LOGGING ==========
app.use((req, res, next) => {
  // Skip logging for OPTIONS requests
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  const start = Date.now();
  
  // Log after response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// ========== ROUTES ==========
// Health check - keep this early
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'WedGram Backend',
    version: '1.0.0',
    uptime: process.uptime(),
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

// API Routes
app.use('/api/v1', routes);

// ========== ERROR HANDLING ==========
// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;