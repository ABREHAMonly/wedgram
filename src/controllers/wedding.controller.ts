import { Request, Response } from 'express';
import Wedding from '../models/Wedding.model';
import { ResponseHandler } from '../utils/apiResponse';
import logger from '../utils/logger';

export const createWedding = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    // Check if wedding already exists
    const existingWedding = await Wedding.findOne({ user: user._id });
    if (existingWedding) {
      ResponseHandler.error(res, 'Wedding already exists', 400);
      return;
    }

    const wedding = await Wedding.create({
      user: user._id,
      ...req.body,
    });

    ResponseHandler.created(res, {
      id: wedding._id,
      title: wedding.title,
      date: wedding.date,
      venue: wedding.venue,
    });
  } catch (error: any) {
    logger.error('Create wedding error:', error);
    ResponseHandler.error(res, 'Failed to create wedding');
  }
};

export const getWedding = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const wedding = await Wedding.findOne({ user: user._id });
    if (!wedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    ResponseHandler.success(res, {
      id: wedding._id,
      title: wedding.title,
      description: wedding.description,
      date: wedding.date,
      venue: wedding.venue,
      venueAddress: wedding.venueAddress,
      dressCode: wedding.dressCode,
      themeColor: wedding.themeColor,
      coverImage: wedding.coverImage,
      gallery: wedding.gallery,
      schedule: wedding.schedule,
    });
  } catch (error) {
    logger.error('Get wedding error:', error);
    ResponseHandler.error(res, 'Failed to fetch wedding');
  }
};

export const updateWedding = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const wedding = await Wedding.findOneAndUpdate(
      { user: user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!wedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    ResponseHandler.success(res, {
      id: wedding._id,
      title: wedding.title,
      description: wedding.description,
      date: wedding.date,
      venue: wedding.venue,
      venueAddress: wedding.venueAddress,
      dressCode: wedding.dressCode,
      themeColor: wedding.themeColor,
      coverImage: wedding.coverImage,
      gallery: wedding.gallery,
      schedule: wedding.schedule,
    });
  } catch (error) {
    logger.error('Update wedding error:', error);
    ResponseHandler.error(res, 'Failed to update wedding');
  }
};

export const checkWedding = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const wedding = await Wedding.findOne({ user: user._id });
    if (!wedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    ResponseHandler.success(res, {
      exists: true,
      id: wedding._id,
      title: wedding.title,
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    ResponseHandler.error(res, 'Wedding not found');
  }
};