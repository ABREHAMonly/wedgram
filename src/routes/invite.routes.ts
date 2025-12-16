// invite.routes.ts
import { Router } from 'express';
import { createInvites, getGuests, sendInvitations } from '../controllers/invite.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createInviteSchema } from '../validations/invite.validation';

const router = Router();

router.use(protect);

router.post('/', validate(createInviteSchema), createInvites);
router.get('/', getGuests);
router.post('/send', sendInvitations);

export default router;