// src\controllers\wedding.controller.ts
import { Request, Response } from 'express';
import Wedding from '../models/Wedding.model';
import { ResponseHandler } from '../utils/apiResponse';
import logger from '../utils/logger';

export const createWedding = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('=== CREATE WEDDING REQUEST ===');
    logger.info('User:', req.user);
    logger.info('Request body:', req.body);
    
    const user = req.user;
    if (!user) {
      logger.info('No user found in request');
      ResponseHandler.unauthorized(res);
      return;
    }

    // Check if wedding already exists
    const existingWedding = await Wedding.findOne({ user: user._id });
    if (existingWedding) {
      logger.info('Wedding already exists for user:', user._id);
      ResponseHandler.error(res, 'Wedding already exists', 400);
      return;
    }

    logger.info('Creating wedding with data:', {
      user: user._id,
      ...req.body,
    });

    const wedding = await Wedding.create({
      user: user._id,
      ...req.body,
    });

    logger.info('Wedding created successfully:', wedding._id);
    
    ResponseHandler.created(res, {
      id: wedding._id,
      title: wedding.title,
      date: wedding.date,
      venue: wedding.venue,
    });
  } catch (error: any) {
    logger.error('=== CREATE WEDDING ERROR ===');
    logger.error('Error name:', error.name);
    logger.error('Error message:', error.message);
    logger.error('Error stack:', error.stack);
    
    // Log validation errors if they exist
    if (error.name === 'ValidationError') {
      logger.error('Validation errors:', error.errors);
      const errors = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      ResponseHandler.validationError(res, errors);
      return;
    }
    
    logger.error('Create wedding error:', error);
    ResponseHandler.error(res, 'Failed to create wedding');
  }
};

export const getWedding = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('=== GET WEDDING REQUEST ===');
    logger.info('User:', req.user);
    
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const wedding = await Wedding.findOne({ user: user._id });
    if (!wedding) {
      logger.info('No wedding found for user:', user._id);
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    logger.info('Wedding found:', wedding._id);
    
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
    console.error('Get wedding error:', error);
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