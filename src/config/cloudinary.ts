// backend/src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger'; // Add this import

export const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn('⚠️ Cloudinary configuration missing. Image uploads will not work.'); // Use logger instead of console
    return;
  }
  
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  
  logger.info('✅ Cloudinary configured'); // Use logger instead of console
};

export default cloudinary;