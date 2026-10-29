import { Request, Response } from 'express';
import { planService } from '../services/plan.service.js';
import { planningOrchestrator } from '../services/ai/planning-orchestrator.js';

export const listPlans = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const plans = await planService.listPlans(eventId);

    res.status(200).json({
      success: true,
      data: plans,
      meta: {
        total: plans.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve event plans.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const getPlan = async (req: Request, res: Response) => {
  try {
    const { planId } = req.params;
    const plan = await planService.getPlanById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Plan '${planId}' was not found.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve plan.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const getLatestPlan = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const plan = await planService.getLatestPlan(eventId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `No active plan found for event '${eventId}'.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve latest plan.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const createPlanVersion = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const plan = await planService.savePlanVersion(eventId, req.body);

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to save plan version.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const generatePlan = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const plan = await planningOrchestrator.generatePlan(eventId, req.body);

    res.status(201).json({
      success: true,
      data: plan,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    const msg = error.message || 'Error occurred while generating plan.';
    let statusCode = 500;
    let code = 'AI_PLANNING_ERROR';

    if (msg.includes('timed out')) {
      statusCode = 504;
      code = 'AI_PROVIDER_TIMEOUT';
    } else if (msg.includes('rate limit')) {
      statusCode = 429;
      code = 'RATE_LIMIT_EXCEEDED';
    } else if (msg.includes('not found')) {
      statusCode = 404;
      code = 'RESOURCE_NOT_FOUND';
    } else if (msg.includes('validation')) {
      statusCode = 422;
      code = 'AI_OUTPUT_VALIDATION_ERROR';
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message: msg,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const revisePlan = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const plan = await planningOrchestrator.revisePlan(eventId, {
      ...req.body,
      planId: req.params.planId || req.body.planId
    });

    res.status(200).json({
      success: true,
      data: plan,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    const msg = error.message || 'Error occurred while revising plan.';
    let statusCode = 500;
    let code = 'AI_REVISION_ERROR';

    if (msg.includes('timed out')) {
      statusCode = 504;
      code = 'AI_PROVIDER_TIMEOUT';
    } else if (msg.includes('rate limit')) {
      statusCode = 429;
      code = 'RATE_LIMIT_EXCEEDED';
    } else if (msg.includes('not found')) {
      statusCode = 404;
      code = 'RESOURCE_NOT_FOUND';
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code,
        message: msg,
        timestamp: new Date().toISOString()
      }
    });
  }
};
