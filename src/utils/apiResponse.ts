// backend/src/utils/apiResponse.ts
import { Response } from 'express';

export interface APIResponse<T = unknown> { // Change any to unknown
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    data?: T,
    message = 'Success',
    statusCode = 200,
    meta?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
    }
  ): Response {
    const response: APIResponse<T> = {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
    
    return res.status(statusCode).json(response);
  }
  
  static created<T>(
    res: Response,
    data?: T,
    message = 'Created successfully'
  ): Response {
    return this.success(res, data, message, 201);
  }
  
 static error(
    res: Response,
    message = 'Internal server error',
    statusCode = 500,
    errors?: Array<{field: string; message: string}>
  ): Response {
    const response: APIResponse<{errors?: Array<{field: string; message: string}>}> = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };
    
    if (errors && errors.length > 0) {
      response.data = { errors };
    }
    
    return res.status(statusCode).json(response);
  }
  
  static validationError(
    res: Response,
    errors: any[],
    message = 'Validation failed'
  ): Response {
    return this.error(
      res,
      message,
      400,
      errors
    );
  }
  
  static notFound(
    res: Response,
    message = 'Resource not found'
  ): Response {
    return this.error(res, message, 404);
  }
  
  static unauthorized(
    res: Response,
    message = 'Unauthorized access'
  ): Response {
    return this.error(res, message, 401);
  }
  
  static forbidden(
    res: Response,
    message = 'Access denied'
  ): Response {
    return this.error(res, message, 403);
  }
  
  static conflict(
    res: Response,
    message = 'Resource already exists'
  ): Response {
    return this.error(res, message, 409);
  }
  
  static rateLimit(
    res: Response,
    message = 'Too many requests'
  ): Response {
    return this.error(res, message, 429);
  }
  
  static badRequest(
    res: Response,
    message = 'Bad request'
  ): Response {
    return this.error(res, message, 400);
  }
}