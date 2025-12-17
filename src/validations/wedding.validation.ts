import Joi from 'joi';

export const createWeddingSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required(),
  
  description: Joi.string()
    .max(1000)
    .optional(),
  
  date: Joi.date()
    .required(),
  
  venue: Joi.string()
    .min(3)
    .max(500)
    .required(),
  
  venueAddress: Joi.string()
    .max(1000)
    .optional(),
  
  dressCode: Joi.string()
    .max(200)
    .optional(),
  
  themeColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export const updateWeddingSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200),
  
  description: Joi.string()
    .max(1000),
  
  date: Joi.date(),
  
  venue: Joi.string()
    .min(3)
    .max(500),
  
  venueAddress: Joi.string()
    .max(1000),
  
  dressCode: Joi.string()
    .max(200),
  
  themeColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/),
  
  coverImage: Joi.string()
    .uri(),
  
  gallery: Joi.array()
    .items(Joi.string().uri())
    .max(20),
});