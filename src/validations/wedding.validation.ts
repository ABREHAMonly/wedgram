//src\validations\wedding.validation.ts
import Joi from 'joi';

export const createWeddingSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Wedding title is required',
      'string.min': 'Wedding title must be at least 1 character',
      'string.max': 'Wedding title cannot exceed 200 characters',
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('', null)
    .default(''),
  
  date: Joi.alternatives()
    .try(
      Joi.date(),
      Joi.string()
    )
    .required()
    .messages({
      'any.required': 'Wedding date is required',
      'alternatives.match': 'Wedding date must be a valid date',
    }),
  
  venue: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Venue is required',
      'string.min': 'Venue must be at least 1 character',
    }),
  
  venueAddress: Joi.string()
    .max(1000)
    .optional()
    .allow('', null)
    .default(''),
  
  dressCode: Joi.string()
    .max(200)
    .optional()
    .allow('', null)
    .default(''),
  
  themeColor: Joi.string()
    .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .optional()
    .allow('', null)
    .default('#667eea'),
});

export const updateWeddingSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(200),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('', null),
  
  date: Joi.alternatives()
    .try(
      Joi.date(),
      Joi.string()
    ),
  
  venue: Joi.string()
    .min(1)
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
    .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
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