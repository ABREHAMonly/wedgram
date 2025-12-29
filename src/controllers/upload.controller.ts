// backend/src/controllers/upload.controller.ts
import { Request, Response } from 'express';
import multer from 'multer';
import cloudinaryService from '../services/cloudinary.service';
import { ResponseHandler } from '../utils/apiResponse';
import logger from '../utils/logger';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  }
});

export const uploadSingleImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    if (!req.file) {
      ResponseHandler.badRequest(res, 'No image file provided');
      return;
    }

    // Get wedding to use ID in folder path
    const Wedding = require('../models/Wedding.model').default;
    const wedding = await Wedding.findOne({ user: user._id });
    
    const folder = wedding 
      ? `wedgram/weddings/${wedding._id}/gallery`
      : `wedgram/users/${user._id}/uploads`;

    // Upload to Cloudinary
    const result = await cloudinaryService.uploadImage(req.file.buffer, folder);

    ResponseHandler.success(res, {
      url: result.secureUrl,
      publicId: result.publicId,
      name: req.file.originalname,
      size: req.file.size,
      format: result.format,
      dimensions: {
        width: result.width,
        height: result.height
      }
    }, 'Image uploaded successfully');
  } catch (error: any) {
    logger.error('Upload image error:', error);
    ResponseHandler.error(res, error.message || 'Failed to upload image');
  }
};

export const uploadMultipleImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      ResponseHandler.badRequest(res, 'No image files provided');
      return;
    }

    // Get wedding to use ID in folder path
    const Wedding = require('../models/Wedding.model').default;
    const wedding = await Wedding.findOne({ user: user._id });
    
    const folder = wedding 
      ? `wedgram/weddings/${wedding._id}/gallery`
      : `wedgram/users/${user._id}/uploads`;

    const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
      try {
        const result = await cloudinaryService.uploadImage(file.buffer, folder);
        return {
          url: result.secureUrl,
          publicId: result.publicId,
          name: file.originalname,
          size: file.size,
          format: result.format,
          dimensions: {
            width: result.width,
            height: result.height
          },
          success: true
        };
      } catch (error) {
        return {
          name: file.originalname,
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        };
      }
    });

    const results = await Promise.all(uploadPromises);

    ResponseHandler.success(res, {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    }, 'Images uploaded successfully');
  } catch (error: any) {
    logger.error('Upload multiple images error:', error);
    ResponseHandler.error(res, error.message || 'Failed to upload images');
  }
};

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { publicId } = req.params;
    
    if (!publicId) {
      ResponseHandler.badRequest(res, 'Public ID is required');
      return;
    }

    await cloudinaryService.deleteImage(publicId);

    ResponseHandler.success(res, null, 'Image deleted successfully');
  } catch (error: any) {
    logger.error('Delete image error:', error);
    ResponseHandler.error(res, error.message || 'Failed to delete image');
  }
};