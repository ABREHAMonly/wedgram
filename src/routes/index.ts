// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import inviteRoutes from './invite.routes';
import rsvpRoutes from './rsvp.routes';
import adminRoutes from './admin.routes';
import weddingRoutes from './wedding.routes'; // Add this

const router = Router();

router.use('/auth', authRoutes);
router.use('/invites', inviteRoutes);
router.use('/rsvp', rsvpRoutes);
router.use('/admin', adminRoutes);
router.use('/wedding', weddingRoutes); // Add this

export default router;