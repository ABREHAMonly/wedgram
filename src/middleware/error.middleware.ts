// backend/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { APIError } from '../utils/apiError';
import logger from '../utils/logger';
import { ResponseHandler } from '../utils/apiResponse';

interface MongoValidationError extends Error {
  errors?: Record<string, { path: string; message: string }>;
}

interface MongoDuplicateError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}

interface MongoCastError extends Error {
  path?: string;
  value?: unknown;
}

export const errorHandler = (
  err: Error | APIError,
  req: Request,
  res: Response,
  _next: NextFunction // Add underscore
) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as Request & { user?: { _id: string } }).user?._id,
  });
  
  if (err instanceof APIError) {
    return ResponseHandler.error(
      res,
      err.message,
      err.statusCode,
      err.errors
    );
  }
  
  if (err.name === 'ValidationError') {
    const mongoError = err as MongoValidationError;
    const errors = mongoError.errors ? Object.values(mongoError.errors).map((error: { path: string; message: string }) => ({
      field: error.path,
      message: error.message,
    })) : [];
    
    return ResponseHandler.validationError(res, errors);
  }
  
  const mongoDuplicateError = err as MongoDuplicateError;
  if (mongoDuplicateError.code === 11000) {
    const field = mongoDuplicateError.keyPattern ? Object.keys(mongoDuplicateError.keyPattern)[0] : 'unknown';
    return ResponseHandler.conflict(res, `${field} already exists`);
  }
  
  if (err.name === 'JsonWebTokenError') {
    return ResponseHandler.unauthorized(res, 'Invalid token');
  }
  
  if (err.name === 'TokenExpiredError') {
    return ResponseHandler.unauthorized(res, 'Token expired');
  }
  
  const mongoCastError = err as MongoCastError;
  if (err.name === 'CastError') {
    return ResponseHandler.notFound(res, `Invalid ${mongoCastError.path || 'resource'} ID`);
  }
  
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  
  return ResponseHandler.error(res, message);
};

export const notFoundHandler = (req: Request, res: Response) => {
  ResponseHandler.notFound(res, `Route ${req.method} ${req.path} not found`);
};