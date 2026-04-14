import { env } from './config/env.js';
import { createApp } from './app.js';
import { prisma } from './db/prisma.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Backend listening on :${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`);
  server.close(() => {
    console.log('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

