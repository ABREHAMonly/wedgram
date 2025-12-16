// backend/src/__tests__/unit/utils/apiResponse.test.ts
import { Response } from 'express';
import { ResponseHandler, APIResponse } from '../../../utils/apiResponse';

describe('ResponseHandler', () => {
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('success', () => {
    it('should return success response with data', () => {
      const testData = { id: 1, name: 'Test' };
      
      ResponseHandler.success(mockResponse as Response, testData, 'Success message', 200);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Success message',
        data: testData,
        timestamp: expect.any(String),
      });
    });

    it('should return success response without data', () => {
      ResponseHandler.success(mockResponse as Response, undefined, 'Success');

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Success',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('created', () => {
    it('should return 201 status with data', () => {
      const testData = { id: '123', name: 'New Resource' };
      
      ResponseHandler.created(mockResponse as Response, testData, 'Created');

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Created',
          data: testData,
        })
      );
    });
  });

  describe('error', () => {
    it('should return error response', () => {
      ResponseHandler.error(mockResponse as Response, 'Error occurred', 400);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error occurred',
        })
      );
    });

    it('should include errors array when provided', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];

      ResponseHandler.error(mockResponse as Response, 'Validation failed', 400, errors);

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { errors },
        })
      );
    });
  });

  describe('validationError', () => {
    it('should return 400 with validation errors', () => {
      const errors = [
        { field: 'email', message: 'Required' },
      ];

      ResponseHandler.validationError(mockResponse as Response, errors);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          data: { errors },
        })
      );
    });
  });

  describe('notFound', () => {
    it('should return 404 error', () => {
      ResponseHandler.notFound(mockResponse as Response, 'Not found');

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not found',
        })
      );
    });
  });

  describe('unauthorized', () => {
    it('should return 401 error', () => {
      ResponseHandler.unauthorized(mockResponse as Response, 'Unauthorized');

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe('conflict', () => {
    it('should return 409 error', () => {
      ResponseHandler.conflict(mockResponse as Response, 'Conflict');

      expect(statusMock).toHaveBeenCalledWith(409);
    });
  });

  describe('rateLimit', () => {
    it('should return 429 error', () => {
      ResponseHandler.rateLimit(mockResponse as Response, 'Too many requests');

      expect(statusMock).toHaveBeenCalledWith(429);
    });
  });
});