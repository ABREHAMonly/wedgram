// src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import User from '../models/User.model';
import Guest from '../models/Guest.model';
import Wedding from '../models/Wedding.model';
import { ResponseHandler } from '../utils/apiResponse';

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalInvites, activeWeddings, pendingRSVPs] = await Promise.all([
      User.countDocuments(), // Changed to count all users
      Guest.countDocuments(),
      Wedding.countDocuments(),
      Guest.countDocuments({ hasRSVPed: false, invited: true }),
    ]);

    ResponseHandler.success(res, {
      totalUsers,
      totalInvites,
      activeWeddings,
      pendingRSVPs,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    ResponseHandler.error(res, 'Failed to fetch statistics');
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find() // Removed role filter
      .skip(skip)
      .limit(Number(limit))
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    ResponseHandler.success(res, users, 'Users retrieved successfully', 200, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    ResponseHandler.error(res, 'Failed to fetch users');
  }
};


export const getAllGuests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const guests = await Guest.find()
      .skip(skip)
      .limit(Number(limit))
      .populate('inviter', 'name email')
      .sort({ createdAt: -1 });

    const total = await Guest.countDocuments();

    ResponseHandler.success(res, guests, 'Guests retrieved successfully', 200, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('Get all guests error:', error);
    ResponseHandler.error(res, 'Failed to fetch guests');
  }
};

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      ResponseHandler.conflict(res, 'Email already exists');
      return;
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    ResponseHandler.created(res, {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error('Create admin error:', error);
    ResponseHandler.error(res, 'Failed to create admin');
  }
};