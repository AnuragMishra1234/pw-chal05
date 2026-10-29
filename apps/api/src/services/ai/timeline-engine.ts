export interface RawPlanTask {
  title: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  daysBeforeEvent: number;
  estimatedDurationMinutes?: number;
  suggestedAssigneeRole?: string;
}

export interface ProcessedPlanTask extends RawPlanTask {
  dueAt: string;
  isPastDueOnCreation: boolean;
  warning?: string;
}

export interface RawMilestone {
  milestoneName: string;
  daysBeforeEvent: number;
  description: string;
}

export interface ProcessedMilestone extends RawMilestone {
  targetDate: string;
  isPastDue: boolean;
}

export interface RawScheduleItem {
  timeOffsetHours: number;
  activityTitle: string;
  locationOrZone?: string;
  leadRole?: string;
}

export interface TimelineEngineResult {
  tasks: ProcessedPlanTask[];
  milestones: ProcessedMilestone[];
  eventDaySchedule: RawScheduleItem[];
  warnings: string[];
}

export class TimelineEngine {
  /**
   * Deterministically calculates concrete ISO timestamps from event start date and relative offsets.
   * Validates feasible sequencing and highlights overdue milestones.
   */
  static processTimeline(
    eventStartDateIso: string,
    rawTasks: RawPlanTask[],
    rawMilestones: RawMilestone[],
    rawSchedule: RawScheduleItem[]
  ): TimelineEngineResult {
    const warnings: string[] = [];
    const eventTime = new Date(eventStartDateIso).getTime();
    const nowTime = Date.now();

    if (isNaN(eventTime)) {
      warnings.push(`Event start date '${eventStartDateIso}' is invalid. Generated relative dates using 30-day baseline.`);
    }

    const baselineDateMs = isNaN(eventTime) ? nowTime + (30 * 24 * 60 * 60 * 1000) : eventTime;

    // Process tasks
    const tasks: ProcessedPlanTask[] = rawTasks.map(t => {
      const offsetDays = Math.max(0, t.daysBeforeEvent || 0);
      const dueTimestamp = baselineDateMs - (offsetDays * 24 * 60 * 60 * 1000);
      const dueAt = new Date(dueTimestamp).toISOString();
      const isPastDueOnCreation = dueTimestamp < nowTime;

      let warning: string | undefined;
      if (isPastDueOnCreation) {
        warning = `Task '${t.title}' was scheduled for ${dueAt.split('T')[0]}, which is prior to the current date. Prioritize immediately.`;
        warnings.push(warning);
      }

      return {
        ...t,
        daysBeforeEvent: offsetDays,
        dueAt,
        isPastDueOnCreation,
        warning
      };
    });

    // Process milestones and sort by earliest deadline first (largest daysBeforeEvent to smallest)
    const milestones: ProcessedMilestone[] = rawMilestones
      .map(m => {
        const offsetDays = Math.max(0, m.daysBeforeEvent || 0);
        const targetTimestamp = baselineDateMs - (offsetDays * 24 * 60 * 60 * 1000);
        const targetDate = new Date(targetTimestamp).toISOString();
        const isPastDue = targetTimestamp < nowTime;

        if (isPastDue) {
          warnings.push(`Milestone '${m.milestoneName}' scheduled for ${targetDate.split('T')[0]} has passed.`);
        }

        return {
          ...m,
          daysBeforeEvent: offsetDays,
          targetDate,
          isPastDue
        };
      })
      .sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent);

    // Process Day-of-Event Schedule and sort by time offset ascending
    const eventDaySchedule = [...rawSchedule].sort((a, b) => (a.timeOffsetHours || 0) - (b.timeOffsetHours || 0));

    return {
      tasks,
      milestones,
      eventDaySchedule,
      warnings
    };
  }
}
