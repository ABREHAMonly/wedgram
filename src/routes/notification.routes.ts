import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  getUnreadCount
} from '../controllers/notification.controller';

const router = Router();

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;