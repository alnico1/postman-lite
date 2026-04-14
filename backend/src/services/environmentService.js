import { prisma } from '../db/prisma.js';

export async function listEnvVars(userId) {
  return prisma.environment.findMany({
    where: { userId },
    orderBy: { key: 'asc' },
    select: { id: true, key: true, value: true, updatedAt: true }
  });
}

export async function upsertEnvVar(userId, { key, value }) {
  return prisma.environment.upsert({
    where: { userId_key: { userId, key } },
    create: { userId, key, value },
    update: { value },
    select: { id: true, key: true, value: true, updatedAt: true }
  });
}

export async function getEnvMap(userId) {
  const vars = await prisma.environment.findMany({
    where: { userId },
    select: { key: true, value: true }
  });
  return Object.fromEntries(vars.map((v) => [v.key, v.value]));
}

