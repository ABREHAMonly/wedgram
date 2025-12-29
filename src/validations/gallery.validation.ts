// backend/src/validations/gallery.validation.ts
// backend/src/validations/gallery.validation.ts
import Joi from 'joi';

export const galleryImageSchema = Joi.object({
  _id: Joi.string()
    .optional()
    .allow('', null),
  
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
    .optional()
    .allow('', null),
  
  uploadedAt: Joi.alternatives()
    .try(Joi.date(), Joi.string())
    .default(() => new Date().toISOString()),
  
  publicId: Joi.string()
    .optional()
    .allow('', null),
  
  format: Joi.string()
    .optional()
    .allow('', null),
  
  dimensions: Joi.object({
    width: Joi.number(),
    height: Joi.number()
  })
  .optional()
  .allow(null),
});

export const updateGallerySchema = Joi.object({
  gallery: Joi.array()
    .items(galleryImageSchema)
    .max(100)
    .required(),
});