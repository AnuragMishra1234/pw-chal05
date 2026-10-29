import { Router } from 'express';
import { listTemplates, getTemplate } from '../controllers/template.controller.js';

export const templateRouter = Router();

templateRouter.get('/', listTemplates);
templateRouter.get('/:id', getTemplate);
