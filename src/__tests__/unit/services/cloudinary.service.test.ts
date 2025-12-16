// backend/src/__tests__/unit/services/cloudinary.service.test.ts
import { CloudinaryService } from '../../../services/cloudinary.service';

// Mock streamifier
const mockPipe = jest.fn();
jest.mock('streamifier', () => ({
  createReadStream: jest.fn(() => ({
    pipe: mockPipe,
  })),
}));

describe('CloudinaryService', () => {
  let cloudinaryService: CloudinaryService;
  
  // Mock cloudinary internally
  const mockUploadStream = jest.fn();
  const mockDestroy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the module to get fresh mocks
    jest.resetModules();
    
    // Setup mocks for cloudinary
    jest.doMock('cloudinary', () => ({
      v2: {
        uploader: {
          upload_stream: mockUploadStream,
          destroy: mockDestroy,
        },
        config: jest.fn(),
      },
    }));
    
    // Re-import the service with fresh mocks
    const { CloudinaryService: CloudinaryServiceClass } = require('../../../services/cloudinary.service');
    cloudinaryService = new CloudinaryServiceClass();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      // Mock successful upload
      mockUploadStream.mockImplementation((options: any, callback: any) => {
        // Simulate async upload
        process.nextTick(() => {
          callback(null, { secure_url: 'https://cloudinary.com/test-image.jpg' });
        });
        return { pipe: jest.fn() };
      });

      const buffer = Buffer.from('test image data');
      const result = await cloudinaryService.uploadImage(buffer, 'test-folder');
      
      expect(result).toBe('https://cloudinary.com/test-image.jpg');
      expect(mockUploadStream).toHaveBeenCalled();
    });

    it('should handle upload error', async () => {
      // Mock upload error
      mockUploadStream.mockImplementation((options: any, callback: any) => {
        process.nextTick(() => {
          callback(new Error('Upload failed'), null);
        });
        return { pipe: jest.fn() };
      });

      const buffer = Buffer.from('test image data');
      
      await expect(cloudinaryService.uploadImage(buffer, 'test-folder'))
        .rejects.toThrow('Upload failed');
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      mockDestroy.mockResolvedValue({ result: 'ok' });
      await cloudinaryService.deleteImage('test-public-id');
      expect(mockDestroy).toHaveBeenCalledWith('test-public-id');
    });
  });
});