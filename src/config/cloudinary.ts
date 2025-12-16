// backend/src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('⚠️ Cloudinary configuration missing. Image uploads will not work.');
    return;
  }
  
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  
  console.log('✅ Cloudinary configured');
};

export default cloudinary;