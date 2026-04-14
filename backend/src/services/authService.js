import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { signToken } from '../utils/jwt.js';

export async function register({ email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: passwordHash },
    select: { id: true, email: true }
  });

  const token = signToken({ sub: user.id, email: user.email });
  return { user, token };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ sub: user.id, email: user.email });
  return { user: { id: user.id, email: user.email }, token };
}

