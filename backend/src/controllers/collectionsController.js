import { createCollection, listCollections, deleteCollection } from '../services/collectionService.js';

export async function createCollectionController(req, res, next) {
  try {
    const created = await createCollection(req.user.id, req.body);
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
}

export async function listCollectionsController(req, res, next) {
  try {
    const items = await listCollections(req.user.id);
    res.json(items);
  } catch (e) {
    next(e);
  }
}

export async function deleteCollectionController(req, res, next) {
  try {
    const result = await deleteCollection(req.user.id, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

