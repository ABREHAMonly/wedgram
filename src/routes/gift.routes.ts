// backend/src/routes/gift.routes.ts
import { Router } from 'express';
import { 
  getGifts, 
  getGift, 
  createGift, 
  updateGift, 
  deleteGift, 
  getGiftStats 
} from '../controllers/gift.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { giftSchema } from '../validations/gift.validation';

const router = Router();

router.use(protect);

router.get('/', getGifts);
router.get('/stats', getGiftStats);
router.get('/:id', getGift);
router.post('/', validate(giftSchema), createGift);
router.put('/:id', validate(giftSchema), updateGift);
router.delete('/:id', deleteGift);

export default router;