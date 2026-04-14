import { sendAndStoreRequest, listRequests, getRequest } from '../services/requestService.js';

export async function sendRequestController(req, res, next) {
  try {
    const saved = await sendAndStoreRequest(req.user.id, req.body);
    res.json(saved);
  } catch (e) {
    next(e);
  }
}

export async function listRequestsController(req, res, next) {
  try {
    const items = await listRequests(req.user.id);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

export async function getRequestController(req, res, next) {
  try {
    const item = await getRequest(req.user.id, req.params.id);
    res.json(item);
  } catch (e) {
    next(e);
  }
}

