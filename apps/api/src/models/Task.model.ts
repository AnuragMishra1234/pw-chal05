import mongoose, { Schema } from 'mongoose';
import { Task } from '@celebration/shared';

export interface TaskDocument extends Omit<Task, 'id'> {
  _id: string;
}

const TaskSchema = new Schema<TaskDocument>(
  {
    _id: { type: String, required: true },
    eventId: { type: String, required: true, index: true },
    planId: { type: String },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    category: { type: String, required: true },
    description: { type: String, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'blocked'],
      default: 'pending'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    dueAt: { type: String },
    estimatedDurationMinutes: { type: Number },
    dependencyTaskIds: [{ type: String }],
    assigneeName: { type: String },
    source: {
      type: String,
      enum: ['template', 'ai', 'user'],
      default: 'user'
    }
  },
  {
    timestamps: true,
    _id: false
  }
);

// Indexes
TaskSchema.index({ eventId: 1, status: 1 });
TaskSchema.index({ eventId: 1, dueAt: 1 });

export const TaskModel = mongoose.models.Task || mongoose.model<TaskDocument>('Task', TaskSchema);
