// backend/src/validations/gallery.validation.ts
import Joi from 'joi';

export const galleryImageSchema = Joi.object({
  url: Joi.string()
    .required()
    .messages({
      'string.empty': 'Image URL is required',
    }),
  
  name: Joi.string()
    .min(2)
    .max(200)
    .required(),
  
  size: Joi.number()
    .min(1)
    .max(50 * 1024 * 1024) // 50MB max
    .required(),
  
  description: Joi.string()
    .max(500)
    .optional(),
  
  uploadedAt: Joi.date()
    .default(Date.now),
  
  publicId: Joi.string()
    .optional(),
  
  format: Joi.string()
    .optional(),
  
  dimensions: Joi.object({
    width: Joi.number(),
    height: Joi.number()
  }).optional(),
});

export const updateGallerySchema = Joi.object({
  gallery: Joi.array()
    .items(galleryImageSchema)
    .max(100)
    .required(),
});