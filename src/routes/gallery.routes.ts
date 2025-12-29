// backend/src/routes/gallery.routes.ts
import { Router } from 'express';
import { 
  updateGallery, 
  addGalleryImage, 
  deleteGalleryImage,
  getGallery 
} from '../controllers/wedding.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateGallerySchema } from '../validations/gallery.validation';
import { UploadController, uploadMultiple } from '../controllers/upload.controller';

const router = Router();

router.use(protect);

// GET gallery
router.get('/', getGallery);

// UPDATE entire gallery
router.put('/', validate(updateGallerySchema), updateGallery);

// ADD single image (with URL) - Remove validation temporarily for debugging
router.post('/images', addGalleryImage); // Remove validate(galleryImageSchema)

// UPLOAD single image (with file)
router.post('/upload', uploadMultiple, UploadController.uploadMultipleImages);

// DELETE image
router.delete('/images/:imageId', deleteGalleryImage);

// Add this new route for Cloudinary deletion
router.delete('/cloudinary/:publicId', UploadController.deleteImage);

export default router;