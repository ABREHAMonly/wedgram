// backend/src/models/Gift.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IGift extends Document {
  wedding: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  link?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'available' | 'reserved' | 'purchased';
  category: string;
  quantity: number;
  purchased: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const giftSchema = new Schema<IGift>(
  {
    wedding: { 
      type: Schema.Types.ObjectId, 
      ref: 'Wedding', 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    price: { 
      type: Number, 
      required: true 
    },
    link: { 
      type: String 
    },
    priority: { 
      type: String, 
      enum: ['high', 'medium', 'low'], 
      default: 'medium' 
    },
    status: { 
      type: String, 
      enum: ['available', 'reserved', 'purchased'], 
      default: 'available' 
    },
    category: { 
      type: String, 
      required: true 
    },
    quantity: { 
      type: Number, 
      default: 1 
    },
    purchased: { 
      type: Number, 
      default: 0 
    },
    image: { 
      type: String 
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model<IGift>('Gift', giftSchema);