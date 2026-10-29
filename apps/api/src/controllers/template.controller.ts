import { Request, Response } from 'express';
import { templateService } from '../services/template.service.js';

export const listTemplates = async (_req: Request, res: Response) => {
  try {
    const templates = await templateService.listTemplates();
    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'TEMPLATE_LOAD_ERROR',
        message: 'Failed to retrieve event templates.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const getTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await templateService.getTemplateById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Template '${id}' does not exist.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve template.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};
