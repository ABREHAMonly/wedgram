import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.model';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@wedgram.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('real password!', salt);

    // Create admin user
    const admin = await User.create({
      name: 'WedGram Admin',
      email: 'real email',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      weddingDate: new Date('2024-12-31'),
      partnerName: 'Admin Partner',
      weddingLocation: 'Admin Venue',
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password: real password!');
    console.log('⚠️ Please change the password immediately after first login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();