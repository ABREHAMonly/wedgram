// backend/src/validations/schedule.validation.ts
import Joi from 'joi';

export const scheduleEventSchema = Joi.object({
  time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  
  event: Joi.string()
    .min(2)
    .max(200)
    .required(),
  
  description: Joi.string()
    .max(1000)
    .optional(),
  
  location: Joi.string()
    .max(200)
    .optional(),
  
  responsible: Joi.string()
    .max(100)
    .optional(),
  
  status: Joi.string()
    .valid('pending', 'confirmed', 'completed')
    .default('pending'),
});

export const updateScheduleSchema = Joi.object({
  schedule: Joi.array()
    .items(scheduleEventSchema)
    .max(50)
    .required(),
});