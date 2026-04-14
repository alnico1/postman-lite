import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { getRequestController, listRequestsController, sendRequestController } from '../controllers/requestsController.js';

const router = Router();

const headersSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional();

const bodySchema = z.union([
  z.record(z.any()),
  z.array(z.any()),
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
]).optional();

const sendSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  url: z.string().url(),
  headers: headersSchema,
  body: bodySchema,
  collectionId: z.string().uuid().optional()
});

router.use(authMiddleware);
router.post('/send', validateBody(sendSchema), sendRequestController);
router.get('/', listRequestsController);
router.get('/:id', getRequestController);

export default router;

