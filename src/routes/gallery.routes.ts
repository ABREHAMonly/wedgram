// backend/src/routes/gallery.routes.ts
import { Router } from 'express';
import { 
  updateGallery, 
  addGalleryImage, 
  deleteGalleryImage,
  getGallery 
} from '../controllers/wedding.controller';
import { 
  uploadSingleImage, 
  uploadMultipleImages, 
  deleteImage,
  upload 
} from '../controllers/upload.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { galleryImageSchema, updateGallerySchema } from '../validations/gallery.validation';

const router = Router();

router.use(protect);

// GET gallery
router.get('/', getGallery);

// UPDATE entire gallery
router.put('/', validate(updateGallerySchema), updateGallery);

// UPLOAD single image (with file)
router.post('/upload', upload.single('image'), uploadSingleImage);

// UPLOAD multiple images (with files)
router.post('/upload-multiple', upload.array('images', 10), uploadMultipleImages);

// DELETE image from Cloudinary
router.delete('/:publicId', deleteImage);

// ADD image to gallery (metadata only - after upload)
router.post('/images', validate(galleryImageSchema), addGalleryImage);

// DELETE image from gallery
router.delete('/images/:imageId', deleteGalleryImage);

export default router;