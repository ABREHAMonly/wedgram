// backend/src/__tests__/unit/utils/apiError.test.ts
import { APIError, ValidationError, AuthenticationError, NotFoundError, ConflictError } from '../../../utils/apiError';

describe('APIError', () => {
  describe('APIError class', () => {
    it('should create APIError with default parameters', () => {
      const error = new APIError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.errors).toBeUndefined();
      expect(error.stack).toBeDefined();
    });

    it('should create APIError with errors array', () => {
      const errors = [{ field: 'email', message: 'Invalid' }];
      const error = new APIError('Validation failed', 400, errors, false);
      
      expect(error.errors).toEqual(errors);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with errors', () => {
      const errors = [
        { field: 'email', message: 'Required' },
        { field: 'password', message: 'Too short' },
      ];
      
      const error = new ValidationError(errors);
      
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('AuthenticationError', () => {
    it('should create AuthenticationError with default message', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
    });

    it('should create AuthenticationError with custom message', () => {
      const error = new AuthenticationError('Custom auth error');
      
      expect(error.message).toBe('Custom auth error');
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with default message', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create NotFoundError with custom resource', () => {
      const error = new NotFoundError('User');
      
      expect(error.message).toBe('User not found');
    });
  });

  describe('ConflictError', () => {
    it('should create ConflictError with default message', () => {
      const error = new ConflictError();
      
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
    });

    it('should create ConflictError with custom message', () => {
      const error = new ConflictError('Email already in use');
      
      expect(error.message).toBe('Email already in use');
    });
  });
});