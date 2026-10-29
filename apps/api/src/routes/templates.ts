import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const templatesRouter = Router();

const resolveTemplatesDir = (): string => {
  const localTemplates = path.resolve(process.cwd(), 'templates');
  if (fs.existsSync(localTemplates)) {
    return localTemplates;
  }
  const rootTemplates = path.resolve(process.cwd(), '../../templates');
  if (fs.existsSync(rootTemplates)) {
    return rootTemplates;
  }
  const parentTemplates = path.resolve(process.cwd(), '../templates');
  if (fs.existsSync(parentTemplates)) {
    return parentTemplates;
  }
  return localTemplates;
};

templatesRouter.get('/', (_req: Request, res: Response) => {
  try {
    const dir = resolveTemplatesDir();
    if (!fs.existsSync(dir)) {
      return res.status(200).json({ success: true, data: [] });
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const templates = files.map(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      return JSON.parse(content);
    });

    return res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'TEMPLATE_LOAD_ERROR',
        message: 'Failed to read template configurations',
        details: error.message
      }
    });
  }
});

templatesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dir = resolveTemplatesDir();
    const filePath = path.join(dir, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: `Event template '${id}' does not exist.`
        }
      });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const template = JSON.parse(content);

    return res.status(200).json({
      success: true,
      data: template
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'TEMPLATE_READ_ERROR',
        message: 'Failed to read template',
        details: error.message
      }
    });
  }
});
