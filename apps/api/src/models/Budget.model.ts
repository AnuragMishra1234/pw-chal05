import mongoose, { Schema } from 'mongoose';
import { Budget } from '@celebration/shared';

export interface BudgetDocument extends Omit<Budget, 'id'> {
  _id: string;
}

const CategoryAllocationSchema = new Schema(
  {
    category: { type: String, required: true },
    allocatedMinorUnits: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    actualSpentMinorUnits: { type: Number, default: 0 }
  },
  { _id: false }
);

const BudgetSchema = new Schema<BudgetDocument>(
  {
    _id: { type: String, required: true },
    eventId: { type: String, required: true, unique: true },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      default: 'INR'
    },
    totalLimitMinorUnits: { type: Number, required: true, min: 1 },
    allocatedMinorUnits: { type: Number, default: 0 },
    contingencyMinorUnits: { type: Number, default: 0 },
    categoryAllocations: [CategoryAllocationSchema]
  },
  {
    timestamps: true,
    _id: false
  }
);

export const BudgetModel = mongoose.models.Budget || mongoose.model<BudgetDocument>('Budget', BudgetSchema);
