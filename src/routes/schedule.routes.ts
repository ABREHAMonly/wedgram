import { Router } from 'express';
import { 
  updateSchedule, 
  addScheduleEvent, 
  updateScheduleEvent, 
  deleteScheduleEvent,
  getSchedule // Add this
} from '../controllers/wedding.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { scheduleEventSchema, updateScheduleSchema } from '../validations/schedule.validation';

const router = Router();

router.use(protect);

// Add this GET route
router.get('/', getSchedule);
router.put('/', validate(updateScheduleSchema), updateSchedule);
router.post('/events', validate(scheduleEventSchema), addScheduleEvent);
router.put('/events/:eventId', validate(scheduleEventSchema), updateScheduleEvent);
router.delete('/events/:eventId', deleteScheduleEvent);

export default router;