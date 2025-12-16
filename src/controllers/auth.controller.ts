// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import User from '../models/User.model';
import { generateToken } from '../middleware/auth.middleware';
import { ResponseHandler } from '../utils/apiResponse';
import { validateEmail, validatePhone } from '../utils/helpers';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, weddingDate, partnerName, weddingLocation } = req.body;

    if (!validateEmail(email)) {
      ResponseHandler.badRequest(res, 'Invalid email address');
      return;
    }

    if (phone && !validatePhone(phone)) {
      ResponseHandler.badRequest(res, 'Invalid phone number');
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      ResponseHandler.conflict(res, 'Email already registered');
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      weddingDate: new Date(weddingDate),
      partnerName,
      weddingLocation,
      role: 'inviter',
    });

    const token = generateToken(user._id.toString(), 'inviter');

    ResponseHandler.created(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        weddingDate: user.weddingDate,
        partnerName: user.partnerName,
      },
      token,
    });
  } catch (error: unknown) { // Changed from any to unknown
    logger.error('Registration error:', error);
    ResponseHandler.error(res, 'Registration failed');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      ResponseHandler.unauthorized(res, 'Invalid credentials');
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      ResponseHandler.unauthorized(res, 'Invalid credentials');
      return;
    }

    if (!user.isActive) {
      ResponseHandler.unauthorized(res, 'Account is deactivated');
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    ResponseHandler.success(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        weddingDate: user.weddingDate,
        partnerName: user.partnerName,
      },
      token,
    });
  } catch (error) {
    logger.error('Login error:', error); // Use logger instead of console
    ResponseHandler.error(res, 'Login failed');
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    ResponseHandler.success(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      weddingDate: user.weddingDate,
      partnerName: user.partnerName,
      weddingLocation: user.weddingLocation,
      phone: user.phone,
    });
  } catch (error) {
    logger.error('Get profile error:', error); // Use logger instead of console
    ResponseHandler.error(res);
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      ResponseHandler.unauthorized(res);
      return;
    }

    const updates = req.body;
    
    // Check if email is being changed
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({ email: updates.email });
      if (existingUser) {
        ResponseHandler.conflict(res, 'Email already in use');
        return;
      }
    }

    // Find the user by ID and update
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      ResponseHandler.notFound(res, 'User not found');
      return;
    }

    ResponseHandler.success(res, {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      weddingDate: updatedUser.weddingDate,
      partnerName: updatedUser.partnerName,
      weddingLocation: updatedUser.weddingLocation,
      phone: updatedUser.phone,
    });
  } catch (error) {
    logger.error('Update profile error:', error); // Use logger instead of console
    ResponseHandler.error(res, 'Failed to update profile');
  }
};