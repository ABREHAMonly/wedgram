// backend/src/utils/apiError.ts
export class APIError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any[];
  
  constructor(
    message: string,
    statusCode: number,
    errors?: any[],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends APIError {
  constructor(errors: any[]) {
    super('Validation failed', 400, errors);
  }
}

export class AuthenticationError extends APIError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}

export class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends APIError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}