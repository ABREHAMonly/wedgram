// backend/src/utils/helpers.ts
import crypto from 'crypto';

export const generateInviteToken = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export const generateInviteLink = (token: string): string => {
  const baseUrl = process.env.INVITE_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Remove trailing slash if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // If baseUrl already contains /invite, don't add it again
  if (cleanBaseUrl.includes('/invite')) {
    return `${cleanBaseUrl}/${token}`;
  }
  
  return `${cleanBaseUrl}/invite/${token}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Updated regex: requires 7-15 digits, allows optional + at start
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  return phoneRegex.test(phone);
};

export const paginate = <T>(array: T[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    page,
    limit,
    total: array.length,
    totalPages: Math.ceil(array.length / limit),
  };
};