// backend/src/controllers/rsvp.controller.ts
import { Request, Response } from 'express';
import Guest from '../models/Guest.model';
import RSVP from '../models/RSVP.model';
import Wedding from '../models/Wedding.model';
import { ResponseHandler } from '../utils/apiResponse';

export const submitRSVP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { response, attendingCount, message, dietaryRestrictions } = req.body;

    const guest = await Guest.findOne({ invitationToken: token });
    if (!guest) {
      ResponseHandler.notFound(res, 'Invitation not found');
      return;
    }

    if (!guest.invited) {
      ResponseHandler.error(res, 'Invitation not sent yet', 400);
      return;
    }

    const wedding = await Wedding.findOne({ user: guest.inviter });
    if (!wedding) {
      ResponseHandler.error(res, 'Wedding not found', 404);
      return;
    }

    const existingRSVP = await RSVP.findOne({ guest: guest._id });
    if (existingRSVP) {
      ResponseHandler.error(res, 'RSVP already submitted', 400);
      return;
    }

    const rsvp = await RSVP.create({
      guest: guest._id,
      wedding: wedding._id,
      response,
      attendingCount,
      message,
      dietaryRestrictions,
    });

    guest.hasRSVPed = true;
    guest.rsvpStatus = response;
    guest.rsvpSubmittedAt = new Date();
    await guest.save();

    ResponseHandler.success(res, {
      message: 'RSVP submitted successfully',
      rsvp: {
        id: rsvp._id,
        response: rsvp.response,
        attendingCount: rsvp.attendingCount,
        submittedAt: rsvp.createdAt,
      },
      guest: {
        name: guest.name,
        rsvpStatus: guest.rsvpStatus,
      },
      wedding: {
        title: wedding.title,
        date: wedding.date,
        venue: wedding.venue,
      },
    });
  } catch (error) {
    console.error('Submit RSVP error:', error);
    ResponseHandler.error(res, 'Failed to submit RSVP');
  }
};

export const getRSVPStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const guest = await Guest.findOne({ invitationToken: token })
      .populate('inviter', 'name email')
      .select('name rsvpStatus hasRSVPed rsvpSubmittedAt');

    if (!guest) {
      ResponseHandler.notFound(res, 'Invitation not found');
      return;
    }

    const wedding = await Wedding.findOne({ user: guest.inviter });
    const rsvp = await RSVP.findOne({ guest: guest._id });

    ResponseHandler.success(res, {
      guest: {
        name: guest.name,
        rsvpStatus: guest.rsvpStatus,
        hasRSVPed: guest.hasRSVPed,
        rsvpSubmittedAt: guest.rsvpSubmittedAt,
      },
      wedding: wedding ? {
        title: wedding.title,
        date: wedding.date,
        venue: wedding.venue,
      } : null,
      rsvp: rsvp ? {
        response: rsvp.response,
        attendingCount: rsvp.attendingCount,
        message: rsvp.message,
        submittedAt: rsvp.createdAt,
      } : null,
    });
  } catch (error) {
    console.error('Get RSVP status error:', error);
    ResponseHandler.error(res, 'Failed to fetch RSVP status');
  }
};