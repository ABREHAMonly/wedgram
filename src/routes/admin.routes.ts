// src/routes/admin.routes.ts
import { Router } from 'express';
import { getStats, getAllUsers, getAllGuests, createAdmin } from '../controllers/admin.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/guests', getAllGuests);
router.post('/create', createAdmin);

export default router;