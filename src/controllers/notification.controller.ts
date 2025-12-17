//src\controllers\notification.controller.ts
import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { ResponseHandler } from '../utils/apiResponse';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { page = 1, limit = 20 } = req.query;
    const result = await NotificationService.getUserNotifications(
      user._id,
      Number(page),
      Number(limit)
    );

    ResponseHandler.success(res, {
      notifications: result.notifications,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    ResponseHandler.error(res, 'Failed to fetch notifications');
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const count = await NotificationService.getUnreadCount(user._id);
    
    ResponseHandler.success(res, { count });
  } catch (error) {
    console.error('Get unread count error:', error);
    ResponseHandler.error(res, 'Failed to get unread count');
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { id } = req.params;
    const notification = await NotificationService.markAsRead(id, user._id);

    if (!notification) {
      ResponseHandler.notFound(res, 'Notification not found');
      return;
    }

    ResponseHandler.success(res, { notification });
  } catch (error) {
    console.error('Mark as read error:', error);
    ResponseHandler.error(res, 'Failed to mark notification as read');
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    await NotificationService.markAllAsRead(user._id);
    
    ResponseHandler.success(res, { message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    ResponseHandler.error(res, 'Failed to mark all notifications as read');
  }
};