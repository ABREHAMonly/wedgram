// backend/src/__tests__/unit/middleware/auth.middleware.test.ts
// Define mock functions
const mockUnauthorized = jest.fn();
const mockResponseHandler = {
  unauthorized: mockUnauthorized,
};

// Mock modules in the right order
jest.mock('../../../utils/apiResponse', () => ({
  ResponseHandler: mockResponseHandler,
}));

jest.mock('../../../models/User.model', () => ({
  findById: jest.fn(),
}));

jest.mock('../../../utils/jwt', () => ({
  verifyToken: jest.fn(),
}));

// Now import the modules
import { Request, Response, NextFunction } from 'express';
import { protect, adminOnly } from '../../../middleware/auth.middleware';
import User from '../../../models/User.model';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      headers: {},
      user: undefined,
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    nextFunction = jest.fn();
  });

  describe('protect middleware', () => {
    it('should return unauthorized if no authorization header', async () => {
      await protect(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockUnauthorized).toHaveBeenCalledWith(mockResponse);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return unauthorized if user not found', async () => {
      // Mock verifyToken
      const { verifyToken } = require('../../../utils/jwt');
      verifyToken.mockReturnValue({ userId: '123', role: 'inviter' });
      
      mockRequest.headers = { authorization: 'Bearer mock-token' };
      
      // Mock findById to return null
      (User.findById as jest.Mock).mockResolvedValue(null);

      await protect(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockUnauthorized).toHaveBeenCalledWith(mockResponse, 'User not found');
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('adminOnly middleware', () => {
    it('should return unauthorized if user is not admin', () => {
      mockRequest.user = { role: 'inviter' } as any;
      
      adminOnly(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockUnauthorized).toHaveBeenCalledWith(mockResponse, 'Admin access required');
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next if user is admin', () => {
      mockRequest.user = { role: 'admin' } as any;
      
      adminOnly(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});