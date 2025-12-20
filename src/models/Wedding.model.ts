// backend/src/models/Wedding.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IScheduleEvent {
  time: string;
  event: string;
  description?: string;
  location?: string;
  responsible?: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface IGalleryImage {
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
  description?: string;
}

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
  gallery: IGalleryImage[];
  schedule: IScheduleEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const galleryImageSchema = new Schema<IGalleryImage>({
  url: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  description: { type: String }
});

const scheduleEventSchema = new Schema<IScheduleEvent>({
  time: { type: String, required: true },
  event: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  responsible: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed'], 
    default: 'pending' 
  }
});

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
    gallery: [galleryImageSchema],
    schedule: [scheduleEventSchema],
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model<IWedding>('Wedding', weddingSchema);