// backend/src/controllers/wedding.controller.ts
import { Request, Response } from 'express';
import Wedding from '../models/Wedding.model';
import { ResponseHandler } from '../utils/apiResponse';
import logger from '../utils/logger';
import cloudinaryService from '../services/cloudinary.service';

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
      gallery: wedding.gallery || [],
      schedule: wedding.schedule || [],
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
      gallery: wedding.gallery || [],
      schedule: wedding.schedule || [],
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

// Schedule Management
export const updateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { schedule } = req.body;

    if (!Array.isArray(schedule)) {
      ResponseHandler.badRequest(res, 'Schedule must be an array');
      return;
    }

    const wedding = await Wedding.findOneAndUpdate(
      { user: user._id },
      { $set: { schedule } },
      { new: true, runValidators: true }
    );

    if (!wedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    ResponseHandler.success(res, {
      message: 'Schedule updated successfully',
      schedule: wedding.schedule,
    });
  } catch (error) {
    logger.error('Update schedule error:', error);
    ResponseHandler.error(res, 'Failed to update schedule');
  }
};

export const addScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const event = req.body;

    const wedding = await Wedding.findOneAndUpdate(
      { user: user._id },
      { $push: { schedule: event } },
      { new: true, runValidators: true }
    );

    if (!wedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    ResponseHandler.created(res, {
      message: 'Event added successfully',
      event: wedding.schedule[wedding.schedule.length - 1],
    });
  } catch (error) {
    logger.error('Add schedule event error:', error);
    ResponseHandler.error(res, 'Failed to add event');
  }
};

export const updateScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { eventId } = req.params;
    const eventUpdate = req.body;

    const wedding = await Wedding.findOne({ user: user._id });
    if (!wedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    const eventIndex = wedding.schedule.findIndex((event: any) => 
      event._id.toString() === eventId
    );

    if (eventIndex === -1) {
      ResponseHandler.notFound(res, 'Event not found');
      return;
    }

    wedding.schedule[eventIndex] = {
  ...(wedding.schedule[eventIndex] as any).toObject(),
  ...eventUpdate,
};

    await wedding.save();

    ResponseHandler.success(res, {
      message: 'Event updated successfully',
      event: wedding.schedule[eventIndex],
    });
  } catch (error) {
    logger.error('Update schedule event error:', error);
    ResponseHandler.error(res, 'Failed to update event');
  }
};

export const deleteScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { eventId } = req.params;

    const wedding = await Wedding.findOneAndUpdate(
      { user: user._id },
      { $pull: { schedule: { _id: eventId } } },
      { new: true }
    );

    if (!wedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    ResponseHandler.success(res, {
      message: 'Event deleted successfully',
    });
  } catch (error) {
    logger.error('Delete schedule event error:', error);
    ResponseHandler.error(res, 'Failed to delete event');
  }
};

// Gallery Management
export const updateGallery = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { gallery } = req.body;

    if (!Array.isArray(gallery)) {
      ResponseHandler.badRequest(res, 'Gallery must be an array');
      return;
    }

    const wedding = await Wedding.findOneAndUpdate(
      { user: user._id },
      { $set: { gallery } },
      { new: true, runValidators: true }
    );

    if (!wedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    ResponseHandler.success(res, {
      message: 'Gallery updated successfully',
      gallery: wedding.gallery,
    });
  } catch (error) {
    logger.error('Update gallery error:', error);
    ResponseHandler.error(res, 'Failed to update gallery');
  }
};

export const addGalleryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    console.log('Adding/updating gallery image:', req.body);

    const image = req.body;

    // Basic validation
    if (!image.url || !image.name) {
      ResponseHandler.badRequest(res, 'Image URL and name are required');
      return;
    }

    // Find the wedding
    const wedding = await Wedding.findOne({ user: user._id });
    if (!wedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    if (image._id) {
  const imageIndex = wedding.gallery.findIndex(
    (img: any) => img._id.toString() === image._id
  );

  if (imageIndex !== -1) {
    // Only update if something actually changed
    const currentImage = wedding.gallery[imageIndex] as any;
    const hasChanges = Object.keys(image).some(key => {
      if (key === '_id') return false;
      if (key === 'uploadedAt') return false;
      return currentImage[key] !== image[key];
    });

    if (hasChanges) {
      wedding.gallery[imageIndex] = {
        ...currentImage.toObject(),
        ...image,
        updatedAt: new Date(),
        // Don't overwrite _id
        _id: wedding.gallery[imageIndex]._id
      };
      
      await wedding.save();
    }
    
    const updatedImage = wedding.gallery[imageIndex];
    
    ResponseHandler.success(res, {
      message: hasChanges ? 'Image updated successfully' : 'No changes detected',
      image: updatedImage,
      _id: updatedImage._id,
      updated: hasChanges
    });
    return;
  }
}

    // If no _id or image not found, add as new image
    // Remove _id if present to let MongoDB generate it
    const { _id, ...imageWithoutId } = image;
    wedding.gallery.push(imageWithoutId as any);
    await wedding.save();

    // Get the last added image
    const addedImage = wedding.gallery[wedding.gallery.length - 1];
    
    ResponseHandler.created(res, {
      message: 'Image added successfully',
      image: addedImage,
      _id: addedImage._id
    });
  } catch (error) {
    console.error('Add/update gallery image error:', error);
    ResponseHandler.error(res, 'Failed to add/update image');
  }
};

export const deleteGalleryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const { imageId } = req.params;

    // First find the wedding and get the image details
    const wedding = await Wedding.findOne({ user: user._id });
    if (!wedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    // Find the image to delete
    const imageToDelete = wedding.gallery.find(
      (img: any) => img._id.toString() === imageId
    );

    // Delete from Cloudinary if publicId exists
    if (imageToDelete?.publicId) {
      await cloudinaryService.deleteImage(imageToDelete.publicId);
    }

    // Remove from database
    const updatedWedding = await Wedding.findOneAndUpdate(
      { user: user._id },
      { $pull: { gallery: { _id: imageId } } },
      { new: true }
    );

    if (!updatedWedding) {
      ResponseHandler.notFound(res, 'Wedding not found');
      return;
    }

    ResponseHandler.success(res, {
      message: 'Image deleted successfully',
    });
  } catch (error) {
    logger.error('Delete gallery image error:', error);
    ResponseHandler.error(res, 'Failed to delete image');
  }
};

export const getSchedule = async (req: Request, res: Response): Promise<void> => {
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

    ResponseHandler.success(res, wedding.schedule || []);
  } catch (error) {
    logger.error('Get schedule error:', error);
    ResponseHandler.error(res, 'Failed to fetch schedule');
  }
};

export const getGallery = async (req: Request, res: Response): Promise<void> => {
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

    ResponseHandler.success(res, wedding.gallery || []);
  } catch (error) {
    logger.error('Get gallery error:', error);
    ResponseHandler.error(res, 'Failed to fetch gallery');
  }
};