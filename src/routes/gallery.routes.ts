import { Router } from 'express';
import { 
  updateGallery, 
  addGalleryImage, 
  deleteGalleryImage,
  getGallery // Add this
} from '../controllers/wedding.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { galleryImageSchema, updateGallerySchema } from '../validations/gallery.validation';

const router = Router();

router.use(protect);

// Add this GET route
router.get('/', getGallery);
router.put('/', validate(updateGallerySchema), updateGallery);
router.post('/images', validate(galleryImageSchema), addGalleryImage);
router.delete('/images/:imageId', deleteGalleryImage);

export default router;