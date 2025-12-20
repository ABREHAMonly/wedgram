// backend/src/controllers/gift.controller.ts
import { Request, Response } from 'express';
import Gift from '../models/Gift.model';
import Wedding from '../models/Wedding.model';
import { ResponseHandler } from '../utils/apiResponse';
import logger from '../utils/logger';

export const getGifts = async (req: Request, res: Response): Promise<void> => {
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

    const gifts = await Gift.find({ wedding: wedding._id })
      .sort({ createdAt: -1 });

    ResponseHandler.success(res, gifts);
  } catch (error) {
    logger.error('Get gifts error:', error);
    ResponseHandler.error(res, 'Failed to fetch gifts');
  }
};

export const getGift = async (req: Request, res: Response): Promise<void> => {
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

    const gift = await Gift.findOne({
      _id: req.params.id,
      wedding: wedding._id,
    });

    if (!gift) {
      ResponseHandler.notFound(res, 'Gift not found');
      return;
    }

    ResponseHandler.success(res, gift);
  } catch (error) {
    logger.error('Get gift error:', error);
    ResponseHandler.error(res, 'Failed to fetch gift');
  }
};

export const createGift = async (req: Request, res: Response): Promise<void> => {
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

    const gift = await Gift.create({
      wedding: wedding._id,
      ...req.body,
    });

    ResponseHandler.created(res, gift);
  } catch (error) {
    logger.error('Create gift error:', error);
    ResponseHandler.error(res, 'Failed to create gift');
  }
};

export const updateGift = async (req: Request, res: Response): Promise<void> => {
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

    const gift = await Gift.findOneAndUpdate(
      { _id: req.params.id, wedding: wedding._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!gift) {
      ResponseHandler.notFound(res, 'Gift not found');
      return;
    }

    ResponseHandler.success(res, gift);
  } catch (error) {
    logger.error('Update gift error:', error);
    ResponseHandler.error(res, 'Failed to update gift');
  }
};

export const deleteGift = async (req: Request, res: Response): Promise<void> => {
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

    const gift = await Gift.findOneAndDelete({
      _id: req.params.id,
      wedding: wedding._id,
    });

    if (!gift) {
      ResponseHandler.notFound(res, 'Gift not found');
      return;
    }

    ResponseHandler.success(res, { message: 'Gift deleted successfully' });
  } catch (error) {
    logger.error('Delete gift error:', error);
    ResponseHandler.error(res, 'Failed to delete gift');
  }
};

export const getGiftStats = async (req: Request, res: Response): Promise<void> => {
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

    const gifts = await Gift.find({ wedding: wedding._id });
    
    const stats = {
      total: gifts.length,
      available: gifts.filter(g => g.status === 'available').length,
      reserved: gifts.filter(g => g.status === 'reserved').length,
      purchased: gifts.filter(g => g.status === 'purchased').length,
      totalValue: gifts.reduce((sum, g) => sum + g.price, 0),
      purchasedValue: gifts
        .filter(g => g.status === 'purchased')
        .reduce((sum, g) => sum + g.price, 0),
      byCategory: gifts.reduce((acc, gift) => {
        acc[gift.category] = (acc[gift.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    ResponseHandler.success(res, stats);
  } catch (error) {
    logger.error('Get gift stats error:', error);
    ResponseHandler.error(res, 'Failed to fetch gift statistics');
  }
};