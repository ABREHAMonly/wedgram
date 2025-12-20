// backend/src/validations/gift.validation.ts
import Joi from 'joi';

export const giftSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .required(),
  
  description: Joi.string()
    .max(1000)
    .optional(),
  
  price: Joi.number()
    .min(0)
    .max(100000)
    .required(),
  
  link: Joi.string()
    .uri()
    .optional(),
  
  priority: Joi.string()
    .valid('high', 'medium', 'low')
    .default('medium'),
  
  status: Joi.string()
    .valid('available', 'reserved', 'purchased')
    .default('available'),
  
  category: Joi.string()
    .max(100)
    .required(),
  
  quantity: Joi.number()
    .min(1)
    .max(100)
    .default(1),
  
  purchased: Joi.number()
    .min(0)
    .max(Joi.ref('quantity'))
    .default(0),
  
  image: Joi.string()
    .uri()
    .optional(),
});