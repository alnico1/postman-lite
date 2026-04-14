import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import envRoutes from './routes/envRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('combined'));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/auth', authRoutes);
  app.use('/requests', requestRoutes);
  app.use('/collections', collectionRoutes);
  app.use('/env', envRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

