//src\routes\wedding.routes.ts
import { Router } from 'express';
import { createWedding, getWedding, updateWedding, checkWedding } from '../controllers/wedding.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createWeddingSchema, updateWeddingSchema } from '../validations/wedding.validation';

const router = Router();

router.use(protect);

router.get('/', getWedding);
router.get('/check', checkWedding);
router.post('/', validate(createWeddingSchema), createWedding);
router.put('/', validate(updateWeddingSchema), updateWedding);

export default router;