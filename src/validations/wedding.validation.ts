//src\validations\wedding.validation.ts
import Joi from 'joi';

export const createWeddingSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required(),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('', null),
  
  date: Joi.alternatives()
    .try(
      Joi.date(),
      Joi.string().isoDate()
    )
    .required(),
  
  venue: Joi.string()
    .min(3)
    .max(500)
    .required(),
  
  venueAddress: Joi.string()
    .max(1000)
    .optional()
    .allow('', null),
  
  dressCode: Joi.string()
    .max(200)
    .optional()
    .allow('', null),
  
  themeColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .allow('', null),
});

export const updateWeddingSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('', null),
  
  date: Joi.alternatives()
    .try(
      Joi.date(),
      Joi.string().isoDate()
    ),
  
  venue: Joi.string()
    .min(3)
    .max(500),
  
  venueAddress: Joi.string()
    .max(1000)
    .optional()
    .allow('', null),
  
  dressCode: Joi.string()
    .max(200)
    .optional()
    .allow('', null),
  
  themeColor: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .allow('', null),
  
  coverImage: Joi.string()
    .uri()
    .optional()
    .allow('', null),
  
  gallery: Joi.array()
    .items(Joi.string().uri())
    .max(20)
    .optional(),
});