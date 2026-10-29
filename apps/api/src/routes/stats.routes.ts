import { Router } from 'express';
import { getStats } from '../controllers/stats.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export const statsRouter = Router();

statsRouter.use(authenticate);
statsRouter.get('/', getStats);
