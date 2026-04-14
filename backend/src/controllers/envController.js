import { listEnvVars, upsertEnvVar } from '../services/environmentService.js';

export async function listEnvController(req, res, next) {
  try {
    const items = await listEnvVars(req.user.id);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

export async function upsertEnvController(req, res, next) {
  try {
    const saved = await upsertEnvVar(req.user.id, req.body);
    res.status(201).json(saved);
  } catch (e) {
    next(e);
  }
}

