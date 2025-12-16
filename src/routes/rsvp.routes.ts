// rsvp.routes.ts
import { Router } from 'express';
import { submitRSVP, getRSVPStatus } from '../controllers/rsvp.controller';
import { validate } from '../middleware/validation.middleware';
import { rsvpSchema } from '../validations/rsvp.validation';

const router = Router();

router.post('/:token', validate(rsvpSchema), submitRSVP);
router.get('/:token', getRSVPStatus);

export default router;