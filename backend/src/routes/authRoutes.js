import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate.js';
import { loginController, registerController } from '../controllers/authController.js';

const router = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

router.post('/register', validateBody(authSchema), registerController);
router.post('/login', validateBody(authSchema), loginController);

export default router;

