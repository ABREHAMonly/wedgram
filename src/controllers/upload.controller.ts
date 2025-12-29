//src\controllers\upload.controller.ts
import { Request, Response } from 'express';
import cloudinaryService from '../services/cloudinary.service'; // Import the instance
import { ResponseHandler } from '../utils/apiResponse';
import logger from '../utils/logger';
import { uploadSingle, uploadMultiple } from '../middleware/upload.middleware';

export class UploadController {
  // Single image upload
  static uploadImage = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        ResponseHandler.badRequest(res, 'No file uploaded');
        return;
      }

      const buffer = req.file.buffer;
      const folder = req.body.folder || 'wedgram';
      
      const url = await cloudinaryService.uploadImage(buffer, folder); // Use the instance
      const publicId = cloudinaryService.extractPublicId(url); // Use the instance
      
      ResponseHandler.success(res, {
        url,
        name: req.file.originalname,
        size: req.file.size,
        publicId,
        success: true
      });
    } catch (error: any) {
      logger.error('Upload image error:', error);
      ResponseHandler.error(res, error.message || 'Failed to upload image');
    }
  };

  // Multiple images upload
  static uploadMultipleImages = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        ResponseHandler.badRequest(res, 'No files uploaded');
        return;
      }

      const files = req.files as Express.Multer.File[];
      const folder = req.body.folder || 'wedgram';
      
      const buffers = files.map(file => file.buffer);
      const urls = await cloudinaryService.uploadMultipleImages(buffers, folder); // Use the instance

      const results = urls.map((url, index) => ({
        url,
        name: files[index].originalname,
        size: files[index].size,
        publicId: cloudinaryService.extractPublicId(url), // Use the instance
        success: true
      }));

      ResponseHandler.success(res, {
        results,
        total: files.length,
        successful: results.length,
        failed: 0
      });
    } catch (error: any) {
      logger.error('Upload multiple images error:', error);
      ResponseHandler.error(res, error.message || 'Failed to upload images');
    }
  };

  // Delete image from Cloudinary
  static deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { publicId } = req.params;
      
      if (!publicId) {
        ResponseHandler.badRequest(res, 'Public ID is required');
        return;
      }

      await cloudinaryService.deleteImage(publicId); // Use the instance
      
      ResponseHandler.success(res, {
        message: 'Image deleted successfully'
      });
    } catch (error: any) {
      logger.error('Delete image error:', error);
      ResponseHandler.error(res, error.message || 'Failed to delete image');
    }
  };
}

// Export middleware functions
export { uploadSingle, uploadMultiple };