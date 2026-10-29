import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { templateRouter } from './template.routes.js';
import { statsRouter } from './stats.routes.js';
import { eventRouter } from './event.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/templates', templateRouter);
apiRouter.use('/stats', statsRouter);
apiRouter.use('/events', eventRouter);
