//src\services\notification.service.ts
import Notification from '../models/Notification.model';
import logger from '../utils/logger';
import mongoose from 'mongoose';

export class NotificationService {
  static async createNotification(
    userId: mongoose.Types.ObjectId | string,
    type: 'rsvp' | 'guest_added' | 'invitation_sent' | 'invitation_failed' | 'message' | 'system',
    title: string,
    description: string,
    data?: Record<string, any>
  ) {
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        description,
        data: data || {},
        read: false,
      });

      logger.info(`Notification created: ${type} for user ${userId}`);
      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      return null;
    }
  }

  // Create notification for new guest
  static async notifyGuestAdded(
    userId: mongoose.Types.ObjectId | string,
    guestName: string,
    guestId: mongoose.Types.ObjectId
  ) {
    return this.createNotification(
      userId,
      'guest_added',
      'Guest Added',
      `You added ${guestName} to your guest list`,
      { guestId, guestName }
    );
  }

  // Create notification for RSVP
  static async notifyRSVP(
    userId: mongoose.Types.ObjectId | string,
    guestName: string,
    status: 'accepted' | 'declined' | 'maybe',
    guestId: mongoose.Types.ObjectId
  ) {
    const statusText = {
      accepted: 'accepted',
      declined: 'declined',
      maybe: 'responded with maybe'
    }[status];

    return this.createNotification(
      userId,
      'rsvp',
      'New RSVP Received',
      `${guestName} has ${statusText} your invitation`,
      { guestId, guestName, status }
    );
  }

  // Create notification for invitation sent
  static async notifyInvitationSent(
    userId: mongoose.Types.ObjectId | string,
    guestName: string,
    method: 'telegram' | 'email' | 'whatsapp',
    guestId: mongoose.Types.ObjectId
  ) {
    return this.createNotification(
      userId,
      'invitation_sent',
      'Invitation Sent',
      `Invitation sent to ${guestName} via ${method}`,
      { guestId, guestName, method }
    );
  }

  // Get notifications for user
  static async getUserNotifications(
    userId: mongoose.Types.ObjectId | string,
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: userId })
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Mark notification as read
  static async markAsRead(
    notificationId: mongoose.Types.ObjectId | string,
    userId: mongoose.Types.ObjectId | string
  ) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    return notification;
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: mongoose.Types.ObjectId | string) {
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    return result;
  }

  // Get unread count
  static async getUnreadCount(userId: mongoose.Types.ObjectId | string) {
    const count = await Notification.countDocuments({
      user: userId,
      read: false
    });

    return count;
  }
}