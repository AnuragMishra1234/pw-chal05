import mongoose, { Schema } from 'mongoose';
import { Plan } from '@celebration/shared';

export interface PlanDocument extends Omit<Plan, 'id'> {
  _id: string;
}

const PlanSchema = new Schema<PlanDocument>(
  {
    _id: { type: String, required: true },
    eventId: { type: String, required: true, index: true },
    version: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      enum: ['active', 'archived', 'superseded'],
      default: 'active'
    },
    previousPlanId: { type: String },
    summary: { type: String, required: true },
    themeAndConcept: { type: Schema.Types.Mixed },
    assumptions: [{ type: String }],
    warnings: [{ type: String }],
    budgetProposal: { type: Schema.Types.Mixed },
    timelineMilestones: [{ type: Schema.Types.Mixed }],
    eventDaySchedule: [{ type: Schema.Types.Mixed }],
    templateSpecificModules: { type: Schema.Types.Mixed },
    recommendations: [{ type: String }]
  },
  {
    timestamps: true,
    _id: false
  }
);

PlanSchema.index({ eventId: 1, version: -1 });

export const PlanModel = mongoose.models.Plan || mongoose.model<PlanDocument>('Plan', PlanSchema);
