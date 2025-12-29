// backend/src/validations/gallery.validation.ts
import Joi from 'joi';

export const galleryImageSchema = Joi.object({
  url: Joi.string()
    .pattern(/^(https?|blob):\/\/.+/) // Allow blob URLs for local uploads
    .required(),
  
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
});

export const updateGallerySchema = Joi.object({
  gallery: Joi.array()
    .items(galleryImageSchema)
    .max(100)
    .required(),
});