// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import { ResponseHandler } from '../utils/apiResponse';
import { verifyToken, signToken } from '../utils/jwt';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Get user - password will be excluded by toJSON transform
    const user = await User.findById(decoded.userId);
    if (!user) {
      ResponseHandler.unauthorized(res, 'User not found');
      return;
    }

    if (!user.isActive) {
      ResponseHandler.unauthorized(res, 'Account is deactivated');
      return;
    }

    // Convert to plain object (toJSON will remove password)
    req.user = user.toJSON() as any;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      ResponseHandler.unauthorized(res, 'Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      ResponseHandler.unauthorized(res, 'Invalid token');
    } else {
      console.error('Auth middleware error:', error);
      ResponseHandler.unauthorized(res, 'Authentication failed');
    }
  }
};

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    ResponseHandler.unauthorized(res, 'Admin access required');
    return;
  }
  next();
};

export const generateToken = signToken;