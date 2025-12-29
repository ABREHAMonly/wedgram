// backend/src/services/cloudinary.service.ts
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import logger from '../utils/logger';

export class CloudinaryService {
  async uploadImage(buffer: Buffer, folder: string = 'wedgram'): Promise<{
    url: string;
    publicId: string;
    secureUrl: string;
    format: string;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            resolve({
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height
            });
          } else {
            reject(new Error('Upload failed with no result'));
          }
        }
      );

      streamifier.createReadStream(buffer).pipe(uploadStream);
    });
  }

  async uploadMultipleImages(buffers: Buffer[], folder: string = 'wedgram'): Promise<
    Array<{
      url: string;
      publicId: string;
      secureUrl: string;
      format: string;
      width: number;
      height: number;
    }>
  > {
    const uploadPromises = buffers.map(buffer => this.uploadImage(buffer, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`Deleted image with publicId: ${publicId}`);
    } catch (error) {
      logger.error('Error deleting image:', error);
      throw error;
    }
  }

  extractPublicId(url: string): string {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.split('.')[0];
  }
}

export default new CloudinaryService();