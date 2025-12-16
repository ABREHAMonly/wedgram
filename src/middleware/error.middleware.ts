// backend/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { APIError } from '../utils/apiError';
import logger from '../utils/logger';
import { ResponseHandler } from '../utils/apiResponse';

export const errorHandler = (
  err: Error | APIError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).user?._id,
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
    const errors = Object.values((err as any).errors).map((error: any) => ({
      field: error.path,
      message: error.message,
    }));
    
    return ResponseHandler.validationError(res, errors);
  }
  
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    return ResponseHandler.conflict(res, `${field} already exists`);
  }
  
  if (err.name === 'JsonWebTokenError') {
    return ResponseHandler.unauthorized(res, 'Invalid token');
  }
  
  if (err.name === 'TokenExpiredError') {
    return ResponseHandler.unauthorized(res, 'Token expired');
  }
  
  if (err.name === 'CastError') {
    return ResponseHandler.notFound(res, 'Invalid resource ID');
  }
  
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;
  
  return ResponseHandler.error(res, message);
};

export const notFoundHandler = (req: Request, res: Response) => {
  ResponseHandler.notFound(res, `Route ${req.method} ${req.path} not found`);
};