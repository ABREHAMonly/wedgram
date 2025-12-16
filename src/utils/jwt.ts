// backend/src/utils/jwt.ts
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  role: 'admin' | 'inviter';
  iat: number;
  exp: number;
}

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret not configured');
  }
  
  return jwt.verify(token, secret) as JwtPayload;
};

export const signToken = (userId: string, role: 'admin' | 'inviter'): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  if (!secret) {
    throw new Error('JWT secret not configured');
  }
  
  const payload = { userId, role };
  
  // Fix: Use type assertion for SignOptions
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};