// backend/src/validations/auth.validation.ts
import Joi from 'joi';
import { Constants } from '../config/constants';

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required(),
  
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .trim(),
  
  password: Joi.string()
    .min(Constants.VALIDATION.PASSWORD_MIN_LENGTH)
    .required(),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
    }),
  
  phone: Joi.string()
    .optional(),
  
  weddingDate: Joi.date()
    .required(),
  
  partnerName: Joi.string()
    .min(2)
    .max(100)
    .optional(),
  
  weddingLocation: Joi.string()
    .min(3)
    .max(500)
    .optional(),
}).custom((value, _helpers) => {
  // Remove confirmPassword before sending to controller
  delete value.confirmPassword;
  return value;
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  
  password: Joi.string()
    .required(),
  
  rememberMe: Joi.boolean()
    .default(false),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required(),
});