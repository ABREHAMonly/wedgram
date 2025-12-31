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

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://wedgram.onrender.com',
  'https://wedgram-frontend.vercel.app', // Updated Vercel domain
  'http://localhost:3001',
];

// CORS configuration function
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if the origin is in the allowed list or if it's a development environment
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    } else {
      logger.warn(`CORS blocked for origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
    'Cache-Control',
    'Origin',
    'X-Request-Id',
    'Access-Control-Allow-Headers'
  ],
  exposedHeaders: [
    'Content-Length',
    'X-Request-Id',
    'Content-Range',
    'X-Total-Count'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Disable specific helmet features that might interfere with API
  contentSecurityPolicy: false,
}));

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle OPTIONS requests for all routes (preflight)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Cache-Control, Origin, X-Request-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  res.status(204).send();
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use(globalRateLimiter);

// Request logging
app.use((req, res, next) => {
  // Don't log in test environment
  if (process.env.NODE_ENV !== 'test') {
    logger.info(`${req.method} ${req.url} - ${req.ip}`);
  }
  next();
});

// Health check
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

// Test endpoints (keep these at the end to not interfere with routes)
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

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;