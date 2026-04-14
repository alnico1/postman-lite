import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { listEnvController, upsertEnvController } from '../controllers/envController.js';

const router = Router();

const upsertSchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_]+$/, 'Key must be alphanumeric/underscore'),
  value: z.string().max(5000)
});

router.use(authMiddleware);
router.get('/', listEnvController);
router.post('/', validateBody(upsertSchema), upsertEnvController);

export default router;

