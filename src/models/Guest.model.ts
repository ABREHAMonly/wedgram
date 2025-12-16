// backend/src/models/Guest.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IGuest extends Document {
  inviter: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  telegramUsername: string;
  chatId?: string;
  invited: boolean;
  hasRSVPed: boolean;
  rsvpStatus: 'pending' | 'accepted' | 'declined' | 'maybe';
  plusOneAllowed: boolean;
  plusOneCount: number;
  dietaryRestrictions?: string;
  invitationMethod: 'telegram' | 'email' | 'whatsapp';
  invitationSentAt?: Date;
  rsvpSubmittedAt?: Date;
  invitationToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const guestSchema = new Schema<IGuest>(
  {
    inviter: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      lowercase: true 
    },
    telegramUsername: { 
      type: String, 
      required: true 
    },
    chatId: { 
      type: String 
    },
    invited: { 
      type: Boolean, 
      default: false 
    },
    hasRSVPed: { 
      type: Boolean, 
      default: false 
    },
    rsvpStatus: { 
      type: String, 
      enum: ['pending', 'accepted', 'declined', 'maybe'], 
      default: 'pending' 
    },
    plusOneAllowed: { 
      type: Boolean, 
      default: false 
    },
    plusOneCount: { 
      type: Number, 
      default: 0 
    },
    dietaryRestrictions: { 
      type: String 
    },
    invitationMethod: { 
      type: String, 
      enum: ['telegram', 'email', 'whatsapp'], 
      default: 'telegram' 
    },
    invitationSentAt: { 
      type: Date 
    },
    rsvpSubmittedAt: { 
      type: Date 
    },
    invitationToken: {
      type: String,
      required: true,
      unique: true,
      // Remove index: true from here to avoid duplicate index warning
    },
  },
  { 
    timestamps: true 
  }
);

// Create indexes
guestSchema.index({ inviter: 1 });
guestSchema.index({ telegramUsername: 1 });

export default mongoose.model<IGuest>('Guest', guestSchema);