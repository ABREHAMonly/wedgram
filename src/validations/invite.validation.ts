// backend/src/validations/invite.validation.ts
import Joi from 'joi';

export const createInviteSchema = Joi.object({
  guests: Joi.array()
    .items(
      Joi.object({
        name: Joi.string()
          .min(2)
          .max(100)
          .required(),
        
        email: Joi.string()
          .email()
          .optional(),
        
        telegramUsername: Joi.string()
          .pattern(/^@?[a-zA-Z0-9_]{5,32}$/)
          .required(),
        
        invitationMethod: Joi.string()
          .valid('telegram', 'email', 'whatsapp')
          .default('telegram'),
        
        plusOneAllowed: Joi.boolean()
          .default(false),
        
        dietaryRestrictions: Joi.string()
          .max(500)
          .optional(),
      })
    )
    .min(1)
    .max(50)
    .required(),
  
  templateId: Joi.string()
    .optional(),
  
  sendImmediately: Joi.boolean()
    .default(true),
});