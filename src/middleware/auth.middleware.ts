// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import { ResponseHandler } from '../utils/apiResponse';
import { verifyToken, signToken } from '../utils/jwt';
import logger from '../utils/logger';
// Extended Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        name: string;
        email: string;
        role: 'admin' | 'inviter';
        isActive: boolean;
        phone?: string;
        weddingDate?: Date;
        partnerName?: string;
        weddingLocation?: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

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

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      ResponseHandler.unauthorized(res, 'User not found');
      return;
    }

    if (!user.isActive) {
      ResponseHandler.unauthorized(res, 'Account is deactivated');
      return;
    }

    // Extract only the fields we need and ensure _id is a string
    const userObject = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      phone: user.phone,
      weddingDate: user.weddingDate,
      partnerName: user.partnerName,
      weddingLocation: user.weddingLocation,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    req.user = userObject;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        ResponseHandler.unauthorized(res, 'Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        ResponseHandler.unauthorized(res, 'Invalid token');
      } else {
        logger.error('Auth middleware error:', error);
        ResponseHandler.unauthorized(res, 'Authentication failed');
      }
    } else {
      logger.error('Auth middleware unknown error:', error);
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