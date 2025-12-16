// backend/src/validations/rsvp.validation.ts
import Joi from 'joi';

export const rsvpSchema = Joi.object({
  response: Joi.string()
    .valid('accepted', 'declined', 'maybe')
    .required(),
  
  attendingCount: Joi.number()
    .min(1)
    .max(20)
    .default(1),
  
  message: Joi.string()
    .max(1000)
    .optional(),
  
  dietaryRestrictions: Joi.string()
    .max(500)
    .optional(),
  
  songRequests: Joi.array()
    .items(Joi.string().max(200))
    .max(5)
    .optional(),
  
  accommodationNeeded: Joi.boolean()
    .default(false),
  
  transportationNeeded: Joi.boolean()
    .default(false),
});