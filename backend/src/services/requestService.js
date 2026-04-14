import axios from 'axios';
import { prisma } from '../db/prisma.js';
import { getEnvMap } from './environmentService.js';
import { normalizeHeaders } from '../utils/http.js';
import { resolveRequest } from './variableResolver.js';

function toAxiosMethod(method) {
  return String(method).toLowerCase();
}

function normalizeMethodEnum(method) {
  const m = String(method).toUpperCase();
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(m)) {
    const err = new Error('Unsupported method');
    err.statusCode = 400;
    throw err;
  }
  return m;
}

function extractAxiosResponsePayload(resp) {
  const headers = resp?.headers ?? {};
  const status = resp?.status ?? null;
  const data = resp?.data;
  return { status, headers, data };
}

function extractAxiosErrorPayload(error) {
  if (error?.response) {
    const { status, headers, data } = extractAxiosResponsePayload(error.response);
    return { status, headers, data };
  }
  return { status: null, headers: {}, data: { message: error?.message ?? 'Request failed' } };
}

export async function sendAndStoreRequest(userId, input) {
  const method = normalizeMethodEnum(input.method);
  const url = String(input.url);
  const headers = normalizeHeaders(input.headers);
  const body = typeof input.body === 'undefined' ? null : input.body;
  const collectionId = input.collectionId ?? null;

  const envMap = await getEnvMap(userId);
  const resolved = resolveRequest({ url, headers, body }, envMap);

  let responsePayload;
  let statusCode;

  try {
    const resp = await axios.request({
      method: toAxiosMethod(method),
      url: resolved.url,
      headers: resolved.headers,
      data: method === 'GET' || method === 'DELETE' ? undefined : resolved.body,
      validateStatus: () => true,
      timeout: 30000
    });
    const { status, headers: respHeaders, data } = extractAxiosResponsePayload(resp);
    statusCode = status ?? null;
    responsePayload = { headers: respHeaders, body: data };
  } catch (e) {
    const { status, headers: respHeaders, data } = extractAxiosErrorPayload(e);
    statusCode = status ?? 0;
    responsePayload = { headers: respHeaders, body: data };
  }

  const saved = await prisma.request.create({
    data: {
      userId,
      collectionId,
      method,
      url: resolved.url,
      headers: resolved.headers,
      body: resolved.body,
      response: responsePayload,
      statusCode: statusCode ?? null
    },
    select: {
      id: true,
      method: true,
      url: true,
      headers: true,
      body: true,
      response: true,
      statusCode: true,
      createdAt: true,
      collectionId: true
    }
  });

  return saved;
}

export async function listRequests(userId) {
  return prisma.request.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      method: true,
      url: true,
      statusCode: true,
      createdAt: true,
      collectionId: true
    }
  });
}

export async function getRequest(userId, requestId) {
  const req = await prisma.request.findFirst({
    where: { id: requestId, userId },
    select: {
      id: true,
      method: true,
      url: true,
      headers: true,
      body: true,
      response: true,
      statusCode: true,
      createdAt: true,
      collectionId: true
    }
  });
  if (!req) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }
  return req;
}

