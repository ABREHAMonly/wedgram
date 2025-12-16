// backend/src/controllers/invite.controller.ts
import { Request, Response } from 'express';
import Guest from '../models/Guest.model';
import Wedding from '../models/Wedding.model';
import { ResponseHandler } from '../utils/apiResponse';
import { generateInviteToken, generateInviteLink } from '../utils/helpers';
import logger from '../utils/logger'; // Add this import
import { IGuest } from '../models/Guest.model'; // Add import for type
import { IWedding } from '../models/Wedding.model'; // Add import for type

export const createInvites = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'inviter') {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { guests, sendImmediately } = req.body;
    const wedding = await Wedding.findOne({ user: user._id });

    if (!wedding) {
      ResponseHandler.error(res, 'Please create your wedding details first', 400);
      return;
    }

    const createdGuests = [];
    const results = [];

    for (const guestData of guests) {
      try {
        const invitationToken = generateInviteToken();
        const guest = await Guest.create({
          inviter: user._id,
          ...guestData,
          invitationToken,
        });

        createdGuests.push(guest);
        results.push({
          id: guest._id,
          name: guestData.name,
          status: 'created',
        });

        if (sendImmediately) {
          await sendInvitationToGuest(guest, wedding);
        }
      } catch (guestError) {
        logger.error(`Failed to create guest ${guestData.name}:`, guestError);
        results.push({
          name: guestData.name,
          error: 'Failed to create',
          status: 'failed',
        });
      }
    }

    ResponseHandler.success(res, {
      message: 'Guests created successfully',
      results,
      total: createdGuests.length,
    });
  } catch (error) {
    logger.error('Create invites error:', error);
    ResponseHandler.error(res, 'Failed to create invitations');
  }
};

export const getGuests = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Use proper type for query
    const query: { inviter: any; rsvpStatus?: string } = { 
      inviter: user._id 
    };
    
    if (status) {
      query.rsvpStatus = status as string;
    }

    const guests = await Guest.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Guest.countDocuments(query);

    ResponseHandler.success(res, guests, 'Guests retrieved successfully', 200, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    logger.error('Get guests error:', error);
    ResponseHandler.error(res, 'Failed to fetch guests');
  }
};

export const sendInvitations = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { guestIds } = req.body;
    const wedding = await Wedding.findOne({ user: user._id });

    if (!wedding) {
      ResponseHandler.error(res, 'Wedding details not found', 404);
      return;
    }

    const guests = await Guest.find({
      _id: { $in: guestIds },
      inviter: user._id,
    });

    const results = [];
    let sentCount = 0;

    for (const guest of guests) {
      try {
        const sent = await sendInvitationToGuest(guest, wedding);
        if (sent) {
          guest.invited = true;
          guest.invitationSentAt = new Date();
          await guest.save();
          sentCount++;
        }

        results.push({
          id: guest._id,
          name: guest.name,
          sent,
          method: guest.invitationMethod,
        });
      } catch (error) {
        logger.error(`Failed to send to ${guest.name}:`, error);
        results.push({
          id: guest._id,
          name: guest.name,
          sent: false,
          error: 'Failed to send',
        });
      }
    }

    ResponseHandler.success(res, {
      message: `Invitations sent to ${sentCount}/${guests.length} guests`,
      results,
    });
  } catch (error) {
    logger.error('Send invitations error:', error);
    ResponseHandler.error(res, 'Failed to send invitations');
  }
};

async function sendInvitationToGuest(guest: IGuest, _wedding: IWedding): Promise<boolean> {
  // Add underscore to indicate intentionally unused parameter
  const inviteLink = generateInviteLink(guest.invitationToken);

  try {
    if (guest.invitationMethod === 'telegram' && guest.chatId) {
      const telegramService = (await import('../services/telegram.service')).default;
      return telegramService.sendInvitation(guest.chatId, guest.name, inviteLink);
    } else if (guest.invitationMethod === 'email' && guest.email) {
      const emailService = (await import('../services/email.service')).default;
      if (emailService.isConfigured && emailService.isConfigured()) {
        return emailService.sendInvitation(guest.email, guest.name, inviteLink);
      } else {
        logger.warn('Email service is not configured');
        return false;
      }
    }

    return false;
  } catch (error) {
    logger.error('Error sending invitation:', error);
    return false;
  }
}