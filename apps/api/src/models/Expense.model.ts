import mongoose, { Schema } from 'mongoose';
import { Expense } from '@celebration/shared';

export interface ExpenseDocument extends Omit<Expense, 'id'> {
  _id: string;
}

const ExpenseSchema = new Schema<ExpenseDocument>(
  {
    _id: { type: String, required: true },
    eventId: { type: String, required: true, index: true },
    category: { type: String, required: true },
    amountMinorUnits: { type: Number, required: true, min: 1 },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['estimate', 'quotation', 'actual'],
      default: 'actual'
    },
    vendorName: { type: String },
    paymentDate: { type: String },
    notes: { type: String, maxlength: 500 },
    receiptUrl: { type: String }
  },
  {
    timestamps: true,
    _id: false
  }
);

ExpenseSchema.index({ eventId: 1, category: 1 });

export const ExpenseModel = mongoose.models.Expense || mongoose.model<ExpenseDocument>('Expense', ExpenseSchema);
