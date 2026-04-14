import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createCollectionController,
  deleteCollectionController,
  listCollectionsController
} from '../controllers/collectionsController.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1).max(100)
});

router.use(authMiddleware);
router.post('/', validateBody(createSchema), createCollectionController);
router.get('/', listCollectionsController);
router.delete('/:id', deleteCollectionController);

export default router;

