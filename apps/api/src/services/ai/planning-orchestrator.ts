import {
  EventDetails,
  Plan,
  RawAIPlanSchema,
  GeneratePlanRequest,
  RevisePlanRequest
} from '@celebration/shared';
import { eventRepository } from '../../repositories/event.repository.js';
import { planRepository } from '../../repositories/plan.repository.js';
import { taskRepository } from '../../repositories/task.repository.js';
import { budgetRepository } from '../../repositories/budget.repository.js';
import { templateService } from '../template.service.js';
import { AIProviderFactory } from './adapter.factory.js';
import { PromptSynthesizer } from './prompt-synthesizer.js';
import { BudgetEngine } from './budget-engine.js';
import { TimelineEngine } from './timeline-engine.js';

export class PlanningOrchestrator {
  /**
   * Orchestrates full 11-stage generation pipeline from event details into a validated, versioned plan.
   */
  async generatePlan(eventId: string, options: GeneratePlanRequest = {}): Promise<Plan> {
    // Stage 1: Load Event & Template
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error(`Event with ID '${eventId}' not found.`);
    }

    const template = await templateService.getTemplateById(event.templateId);

    // Stage 2 & 3: Context & Prompt Synthesis
    const { systemPrompt, userPrompt } = PromptSynthesizer.synthesizeInitialPlanPrompt(
      event,
      template,
      options.userGuidance
    );

    // Stage 4 & 5: Dispatch to Provider Adapter
    const adapter = AIProviderFactory.getAdapter(options.provider);
    const response = await adapter.generateStructuredPlan({
      systemPrompt,
      userPrompt,
      temperature: options.temperature ?? 0.3
    });

    // Stage 6 & 7: Parse JSON & Zod Validation with Bounded Repair
    const parsedRaw = this.parseAndValidate(response.rawContent);

    // Stage 8: Deterministic Budget Calculations
    const budgetResult = BudgetEngine.processProposal(
      event.budgetLimitMinorUnits,
      event.currency,
      parsedRaw.budgetProposal.categories,
      parsedRaw.budgetProposal.suggestedContingencyPercentage
    );

    // Stage 9: Deterministic Timeline & Date Calculations
    const timelineResult = TimelineEngine.processTimeline(
      event.startDate,
      parsedRaw.tasks,
      parsedRaw.timelineMilestones,
      parsedRaw.eventDaySchedule
    );

    // Aggregate any warnings
    const combinedWarnings = [
      ...parsedRaw.warnings,
      ...budgetResult.warnings,
      ...timelineResult.warnings
    ];

    // Stage 10: Persist New Plan Version
    const existingActive = await planRepository.findLatestByEvent(eventId);
    if (existingActive) {
      await planRepository.updateStatus(existingActive.id, 'superseded');
    }

    const nextVersion = existingActive ? existingActive.version + 1 : 1;
    const planId = `pln-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const planToSave: Plan = {
      id: planId,
      eventId,
      version: nextVersion,
      status: 'active',
      previousPlanId: existingActive?.id,
      summary: parsedRaw.summary,
      themeAndConcept: parsedRaw.themeAndConcept,
      assumptions: parsedRaw.assumptions,
      warnings: combinedWarnings,
      budgetProposal: {
        suggestedContingencyPercentage: budgetResult.contingencyPercentage,
        categories: budgetResult.categoryAllocations.map(c => ({
          categoryName: c.category,
          percentageOfBudget: c.percentage,
          reasoning: c.reasoning,
          savingTips: c.savingTips
        }))
      },
      timelineMilestones: timelineResult.milestones.map(m => ({
        milestoneName: m.milestoneName,
        daysBeforeEvent: m.daysBeforeEvent,
        description: m.description
      })),
      eventDaySchedule: timelineResult.eventDaySchedule,
      templateSpecificModules: parsedRaw.templateSpecificModules || {},
      recommendations: parsedRaw.recommendations,
      createdAt: now
    };

    const savedPlan = await planRepository.create(planToSave);

    // Stage 11: Non-destructively sync tasks and budget records
    await this.syncTasks(eventId, planId, timelineResult.tasks);
    await this.syncBudget(eventId, event.currency, budgetResult);

    return savedPlan;
  }

  /**
   * Revises an existing plan using natural-language instructions while preserving user data.
   */
  async revisePlan(eventId: string, options: RevisePlanRequest): Promise<Plan> {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error(`Event with ID '${eventId}' not found.`);
    }

    const currentPlan = options.planId
      ? await planRepository.findById(options.planId)
      : await planRepository.findLatestByEvent(eventId);

    if (!currentPlan) {
      throw new Error(`No active plan found for event '${eventId}' to revise.`);
    }

    const template = await templateService.getTemplateById(event.templateId);

    const { systemPrompt, userPrompt } = PromptSynthesizer.synthesizeRevisionPrompt(
      event,
      currentPlan,
      options.revisionInstructions,
      template
    );

    const adapter = AIProviderFactory.getAdapter();
    const response = await adapter.generateStructuredPlan({
      systemPrompt,
      userPrompt,
      temperature: 0.3
    });

    const parsedRaw = this.parseAndValidate(response.rawContent);

    // Deterministic calculations
    const budgetResult = BudgetEngine.processProposal(
      event.budgetLimitMinorUnits,
      event.currency,
      parsedRaw.budgetProposal.categories,
      parsedRaw.budgetProposal.suggestedContingencyPercentage
    );

    const timelineResult = TimelineEngine.processTimeline(
      event.startDate,
      parsedRaw.tasks,
      parsedRaw.timelineMilestones,
      parsedRaw.eventDaySchedule
    );

    const combinedWarnings = [
      ...parsedRaw.warnings,
      ...budgetResult.warnings,
      ...timelineResult.warnings
    ];

    // Mark current plan as superseded
    await planRepository.updateStatus(currentPlan.id, 'superseded');

    const nextVersion = currentPlan.version + 1;
    const planId = `pln-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const revisedPlan: Plan = {
      id: planId,
      eventId,
      version: nextVersion,
      status: 'active',
      previousPlanId: currentPlan.id,
      summary: parsedRaw.summary,
      themeAndConcept: parsedRaw.themeAndConcept,
      assumptions: parsedRaw.assumptions,
      warnings: combinedWarnings,
      budgetProposal: {
        suggestedContingencyPercentage: budgetResult.contingencyPercentage,
        categories: budgetResult.categoryAllocations.map(c => ({
          categoryName: c.category,
          percentageOfBudget: c.percentage,
          reasoning: c.reasoning,
          savingTips: c.savingTips
        }))
      },
      timelineMilestones: timelineResult.milestones.map(m => ({
        milestoneName: m.milestoneName,
        daysBeforeEvent: m.daysBeforeEvent,
        description: m.description
      })),
      eventDaySchedule: timelineResult.eventDaySchedule,
      templateSpecificModules: parsedRaw.templateSpecificModules || {},
      recommendations: parsedRaw.recommendations,
      createdAt: now
    };

    const savedPlan = await planRepository.create(revisedPlan);

    // Sync tasks non-destructively
    await this.syncTasks(eventId, planId, timelineResult.tasks);
    await this.syncBudget(eventId, event.currency, budgetResult);

    return savedPlan;
  }

  /**
   * Safely cleans Markdown blocks and parses raw model output, verifying with Zod.
   */
  private parseAndValidate(raw: string): any {
    let cleanJson = raw.trim();

    // Strip markdown code fences if present (e.g. ```json ... ```)
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (err: any) {
      throw new Error(`Failed to parse AI output as JSON: ${err.message}. Raw preview: ${cleanJson.substring(0, 150)}...`);
    }

    const validation = RawAIPlanSchema.safeParse(parsed);
    if (!validation.success) {
      const issues = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`AI plan failed schema validation: ${issues}`);
    }

    return validation.data;
  }

  /**
   * Non-destructive task synchronization: Preserves completed and user-created tasks.
   */
  private async syncTasks(eventId: string, planId: string, generatedTasks: any[]) {
    const existingTasks = await taskRepository.listByEvent(eventId);
    const existingTitles = new Set(existingTasks.map(t => t.title.toLowerCase().trim()));
    const now = new Date().toISOString();

    for (const t of generatedTasks) {
      // If user hasn't already created a task with this title, insert it
      if (!existingTitles.has(t.title.toLowerCase().trim())) {
        await taskRepository.create({
          id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          eventId,
          planId,
          title: t.title,
          category: t.category,
          description: t.description,
          status: 'pending',
          priority: t.priority,
          dueAt: t.dueAt,
          estimatedDurationMinutes: t.estimatedDurationMinutes,
          dependencyTaskIds: [],
          assigneeName: t.suggestedAssigneeRole,
          source: 'ai',
          createdAt: now,
          updatedAt: now
        });
      }
    }
  }

  /**
   * Synchronizes budget category allocations with the deterministic AI calculation result.
   */
  private async syncBudget(eventId: string, currency: any, budgetResult: any) {
    const existingBudget = await budgetRepository.findByEventId(eventId);
    const now = new Date().toISOString();

    const categoryAllocations = budgetResult.categoryAllocations.map((cat: any) => {
      // Preserve existing actual spent in matching category if present
      const existingCat = existingBudget?.categoryAllocations?.find(c => c.category === cat.category);
      return {
        category: cat.category,
        percentage: cat.percentage,
        allocatedMinorUnits: cat.allocatedMinorUnits,
        actualSpentMinorUnits: existingCat?.actualSpentMinorUnits || 0
      };
    });

    if (existingBudget) {
      await budgetRepository.update(eventId, {
        allocatedMinorUnits: budgetResult.allocatedMinorUnits,
        contingencyMinorUnits: budgetResult.contingencyMinorUnits,
        categoryAllocations,
        updatedAt: now
      });
    } else {
      await budgetRepository.create({
        id: `bdg-${eventId}`,
        eventId,
        currency,
        totalLimitMinorUnits: budgetResult.totalLimitMinorUnits,
        allocatedMinorUnits: budgetResult.allocatedMinorUnits,
        contingencyMinorUnits: budgetResult.contingencyMinorUnits,
        categoryAllocations,
        updatedAt: now
      });
    }
  }
}

export const planningOrchestrator = new PlanningOrchestrator();
