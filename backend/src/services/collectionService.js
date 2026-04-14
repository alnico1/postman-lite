import { prisma } from '../db/prisma.js';

export async function createCollection(userId, { name }) {
  try {
    return await prisma.collection.create({
      data: { userId, name },
      select: { id: true, name: true, createdAt: true, updatedAt: true }
    });
  } catch (e) {
    if (e?.code === 'P2002') {
      const err = new Error('Collection name already exists');
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
}

export async function listCollections(userId) {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { requests: true } }
    }
  });
}

export async function deleteCollection(userId, collectionId) {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true }
  });
  if (!existing) {
    const err = new Error('Collection not found');
    err.statusCode = 404;
    throw err;
  }

  await prisma.collection.delete({ where: { id: collectionId } });
  return { ok: true };
}

