// backend/src/__tests__/unit/services/cloudinary.service.test.ts
// Mock cloudinary
const mockUploadStream = jest.fn();
const mockDestroy = jest.fn();

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: mockUploadStream,
      destroy: mockDestroy,
    },
    config: jest.fn(),
  },
}));

jest.mock('streamifier', () => ({
  createReadStream: jest.fn(() => ({
    pipe: jest.fn(),
  })),
}));

import { CloudinaryService } from '../../../services/cloudinary.service';

describe('CloudinaryService', () => {
  let cloudinaryService: CloudinaryService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    cloudinaryService = new CloudinaryService();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      // Mock successful upload
      mockUploadStream.mockImplementationOnce((_options, callback) => {
        callback(null, { secure_url: 'https://cloudinary.com/test-image.jpg' });
        return { pipe: jest.fn() };
      });

      const buffer = Buffer.from('test image data');
      const result = await cloudinaryService.uploadImage(buffer, 'test-folder');
      
      expect(result).toBe('https://cloudinary.com/test-image.jpg');
    });

    it('should handle upload error', async () => {
      // Mock upload error
      mockUploadStream.mockImplementationOnce((_options, callback) => {
        callback(new Error('Upload failed'), null);
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