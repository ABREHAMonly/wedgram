//src\models\Notification.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'rsvp' | 'guest_added' | 'invitation_sent' | 'invitation_failed' | 'message' | 'system';
  title: string;
  description: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['rsvp', 'guest_added', 'invitation_sent', 'invitation_failed', 'message', 'system'],
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    data: { 
      type: Schema.Types.Mixed,
      default: {}
    },
    read: { 
      type: Boolean, 
      default: false 
    },
  },
  { 
    timestamps: true 
  }
);

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema);