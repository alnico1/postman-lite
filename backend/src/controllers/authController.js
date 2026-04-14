import { register, login } from '../services/authService.js';

export async function registerController(req, res, next) {
  try {
    const result = await register(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function loginController(req, res, next) {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

