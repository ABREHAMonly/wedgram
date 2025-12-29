import { Router } from 'express';
import { 
  updateGallery, 
  addGalleryImage, 
  deleteGalleryImage,
  getGallery 
} from '../controllers/wedding.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { galleryImageSchema, updateGallerySchema } from '../validations/gallery.validation';
import { UploadController, uploadMultiple } from '../controllers/upload.controller';

const router = Router();

router.use(protect);

// GET gallery
router.get('/', getGallery);

// UPDATE entire gallery
router.put('/', validate(updateGallerySchema), updateGallery);

// ADD single image (with URL)
router.post('/images', validate(galleryImageSchema), addGalleryImage);

// UPLOAD single image (with file)
router.post('/upload', uploadMultiple, UploadController.uploadMultipleImages);

// DELETE image
router.delete('/images/:imageId', deleteGalleryImage);

export default router;