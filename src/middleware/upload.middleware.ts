//src\middleware\upload.middleware.ts
import multer from 'multer';
import { Request } from 'express';

const storage = multer.memoryStorage();

// Fix: Import Express types properly or use global namespace
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 10
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits
}).single('image');

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits
}).array('images', 10);

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits
});