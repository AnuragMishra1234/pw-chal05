import mongoose, { Schema } from 'mongoose';
import { EventDetails } from '@celebration/shared';

export interface EventDocument extends Omit<EventDetails, 'id'> {
  _id: string;
}

const EventSchema = new Schema<EventDocument>(
  {
    _id: { type: String, required: true },
    ownerId: { type: String, required: true, default: 'usr-organizer-default' },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    eventType: {
      type: String,
      required: true,
      enum: ['wedding', 'birthday', 'college_hackathon', 'community_event', 'corporate_conference', 'custom']
    },
    templateId: { type: String, required: true },
    templateVersion: { type: String, default: '1.0.0' },
    description: { type: String, trim: true, maxlength: 1000 },
    startDate: { type: String, required: true },
    endDate: { type: String },
    timezone: { type: String, default: 'Asia/Kolkata' },
    location: {
      type: { type: String, enum: ['physical', 'virtual', 'hybrid'], default: 'physical' },
      address: { type: String },
      city: { type: String },
      country: { type: String },
      virtualUrl: { type: String }
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      default: 'INR'
    },
    budgetLimitMinorUnits: { type: Number, required: true, min: 1 },
    expectedAttendance: { type: Number, required: true, min: 1 },
    preferences: { type: Schema.Types.Mixed, default: {} },
    customPrompt: { type: String },
    activeModules: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'archived'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    _id: false
  }
);

// Indexes
EventSchema.index({ ownerId: 1, startDate: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ eventType: 1 });

export const EventModel = mongoose.models.Event || mongoose.model<EventDocument>('Event', EventSchema);
