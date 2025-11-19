import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createVerse,
  getVerses,
  getVerse,
  getVersesDue,
  updateVerse,
  deleteVerse,
  getVerseStats,
} from '../controllers/verseController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/verses - Get all verses for current user
router.get('/', getVerses);

// GET /api/verses/due - Get verses due for review
router.get('/due', getVersesDue);

// GET /api/verses/stats - Get verse statistics
router.get('/stats', getVerseStats);

// GET /api/verses/:id - Get a specific verse
router.get('/:id', getVerse);

// POST /api/verses - Create a new verse
router.post('/', createVerse);

// PUT /api/verses/:id - Update a verse
router.put('/:id', updateVerse);

// DELETE /api/verses/:id - Delete a verse
router.delete('/:id', deleteVerse);

export default router;
