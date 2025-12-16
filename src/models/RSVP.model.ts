// backend/src/models/RSVP.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IRSVP extends Document {
  guest: mongoose.Types.ObjectId;
  wedding: mongoose.Types.ObjectId;
  response: 'accepted' | 'declined' | 'maybe';
  attendingCount: number;
  message?: string;
  dietaryRestrictions?: string;
  songRequests?: string[];
  accommodationNeeded: boolean;
  transportationNeeded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const rsvpSchema = new Schema<IRSVP>(
  {
    guest: { 
      type: Schema.Types.ObjectId, 
      ref: 'Guest', 
      required: true 
    },
    wedding: { 
      type: Schema.Types.ObjectId, 
      ref: 'Wedding', 
      required: true 
    },
    response: { 
      type: String, 
      enum: ['accepted', 'declined', 'maybe'], 
      required: true 
    },
    attendingCount: { 
      type: Number, 
      default: 1, 
      min: 0
    },
    message: { 
      type: String 
    },
    dietaryRestrictions: { 
      type: String 
    },
    songRequests: [{ 
      type: String 
    }],
    accommodationNeeded: { 
      type: Boolean, 
      default: false 
    },
    transportationNeeded: { 
      type: Boolean, 
      default: false 
    },
  },
  { 
    timestamps: true 
  }
);

rsvpSchema.index({ guest: 1, wedding: 1 }, { unique: true });

export default mongoose.model<IRSVP>('RSVP', rsvpSchema);