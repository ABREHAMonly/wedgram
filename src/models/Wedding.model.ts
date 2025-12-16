// backend/src/models/Wedding.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IWedding extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  venue: string;
  venueAddress?: string;
  dressCode?: string;
  themeColor?: string;
  coverImage?: string;
  gallery?: string[];
  schedule: Array<{
    time: Date;
    event: string;
    description?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const weddingSchema = new Schema<IWedding>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    date: { 
      type: Date, 
      required: true 
    },
    venue: { 
      type: String, 
      required: true 
    },
    venueAddress: { 
      type: String 
    },
    dressCode: { 
      type: String 
    },
    themeColor: { 
      type: String, 
      default: '#667eea' 
    },
    coverImage: { 
      type: String 
    },
    gallery: [{ 
      type: String 
    }],
    schedule: [{
      time: Date,
      event: String,
      description: String,
    }],
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model<IWedding>('Wedding', weddingSchema);