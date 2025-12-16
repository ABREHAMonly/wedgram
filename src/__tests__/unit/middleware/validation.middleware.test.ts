// backend/src/__tests__/unit/middleware/validation.middleware.test.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validate, validateParams } from '../../../middleware/validation.middleware';
import { ResponseHandler } from '../../../utils/apiResponse';

// Mock ResponseHandler
jest.mock('../../../utils/apiResponse');

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    nextFunction = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('validate middleware', () => {
    const testSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    it('should call next if validation passes', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(ResponseHandler.validationError).not.toHaveBeenCalled();
    });

    it('should return validation error if validation fails', () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: '123',
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(ResponseHandler.validationError).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should strip unknown fields', () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        extraField: 'should be removed',
      };

      const middleware = validate(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.body).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('validateParams middleware', () => {
    const testSchema = Joi.object({
      id: Joi.string().length(24).hex().required(),
    });

    it('should call next if params validation passes', () => {
      mockRequest.params = {
        id: '507f1f77bcf86cd799439011',
      };

      const middleware = validateParams(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(ResponseHandler.validationError).not.toHaveBeenCalled();
    });

    it('should return validation error if params validation fails', () => {
      mockRequest.params = {
        id: 'invalid-id',
      };

      const middleware = validateParams(testSchema);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(ResponseHandler.validationError).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});