// backend/src/controllers/invite.controller.ts
import { Request, Response } from 'express';
import Guest from '../models/Guest.model';
import Wedding from '../models/Wedding.model';
import { ResponseHandler } from '../utils/apiResponse';
import { generateInviteToken, generateInviteLink } from '../utils/helpers';
import logger from '../utils/logger';
import { IGuest } from '../models/Guest.model';
import { IWedding } from '../models/Wedding.model';
import { Types } from 'mongoose';

export const createInvites = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'inviter') {
      ResponseHandler.unauthorized(res);
      return;
    }

    logger.info('=== CREATE INVITES REQUEST ===')
    logger.info('User:', user._id)
    logger.info('Request body:', req.body)

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
        // Clean Telegram username - remove @ if present
        let telegramUsername = guestData.telegramUsername
        if (telegramUsername.startsWith('@')) {
          telegramUsername = telegramUsername.substring(1)
        }
        
        logger.info(`Processing guest: ${guestData.name}`)
       logger.info(`Telegram username (cleaned): ${telegramUsername}`)
        
        const invitationToken = generateInviteToken();
        const guest = await Guest.create({
          inviter: new Types.ObjectId(user._id),
          ...guestData,
          telegramUsername, // Use cleaned username
          invitationToken,
        });

        logger.info(`Guest created: ${guest._id}`)
        
        createdGuests.push(guest);
        results.push({
          id: guest._id,
          name: guestData.name,
          status: 'created',
          telegramUsername: guest.telegramUsername
        });

        if (sendImmediately) {
          logger.info(`Sending invitation immediately to ${guest.name}`)
          const sent = await sendInvitationToGuest(guest, wedding);
          logger.info(`Invitation sent: ${sent}`)
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
  } catch (error: unknown) {
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

    const query: { inviter: Types.ObjectId; rsvpStatus?: string } = { 
      inviter: new Types.ObjectId(user._id) 
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
  } catch (error: unknown) {
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
      _id: { $in: guestIds.map((id: string) => new Types.ObjectId(id)) },
      inviter: new Types.ObjectId(user._id),
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
  } catch (error: unknown) {
    logger.error('Send invitations error:', error);
    ResponseHandler.error(res, 'Failed to send invitations');
  }
};

async function sendInvitationToGuest(guest: IGuest, _wedding: IWedding): Promise<boolean> {
  const inviteLink = generateInviteLink(guest.invitationToken);
  logger.info(`=== SENDING INVITATION TO GUEST ===`)
  logger.info(`Guest: ${guest.name}`)
   logger.info(`Method: ${guest.invitationMethod}`)
   logger.info(`Invite link: ${inviteLink}`)

  try {
    if (guest.invitationMethod === 'telegram') {
      logger.info(`Looking for Telegram username: ${guest.telegramUsername}`)
      
      // For Telegram, we need to have a chatId
      // If no chatId, we can't send the invitation yet
      if (!guest.chatId) {
         logger.warn(`No chatId for guest ${guest.name}. Guest needs to start the bot first.`)
        
        // We could try to get chatId from username, but usually we need them to start the bot
        // For now, return false - the invitation will be sent when they start the bot
        return false
      }
      
       logger.info(`Sending Telegram invitation to chatId: ${guest.chatId}`)
      const telegramService = (await import('../services/telegram.service')).default;
      return await telegramService.sendInvitation(guest.chatId, guest.name, inviteLink);
      
    } else if (guest.invitationMethod === 'email' && guest.email) {
       logger.info(`Sending email invitation to: ${guest.email}`)
      const emailService = (await import('../services/email.service')).default;
      if (emailService.isConfigured && emailService.isConfigured()) {
        return await emailService.sendInvitation(guest.email, guest.name, inviteLink);
      } else {
         logger.warn('Email service is not configured')
        return false
      }
    }

     logger.warn(`No valid invitation method found for ${guest.name}`)
    return false
  } catch (error) {
    console.error(`Error sending invitation to ${guest.name}:`, error)
    return false
  }
}