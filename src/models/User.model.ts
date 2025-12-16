// backend/src/models/User.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'inviter';
  isActive: boolean;
  weddingDate?: Date;
  partnerName?: string;
  weddingLocation?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String 
    },
    role: { 
      type: String, 
      enum: ['admin', 'inviter'], 
      default: 'inviter' 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    weddingDate: { 
      type: Date 
    },
    partnerName: { 
      type: String 
    },
    weddingLocation: { 
      type: String 
    },
    refreshToken: { 
      type: String 
    },
  },
  { 
    timestamps: true 
  }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create a method to get user without password
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete (userObject as any).password;
  delete (userObject as any).refreshToken;
  return userObject;
};

export default mongoose.model<IUser>('User', userSchema);