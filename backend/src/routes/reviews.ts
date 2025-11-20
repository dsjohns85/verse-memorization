import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createReview,
  getReviewsByVerse,
  getReviewHistory,
  getReviewStats,
} from '../controllers/reviewController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// TODO: Add rate limiting for production (e.g., express-rate-limit)
// Recommended: 50 requests per 15 minutes per user

// GET /api/reviews/history - Get review history
router.get('/history', getReviewHistory);

// GET /api/reviews/stats - Get review statistics
router.get('/stats', getReviewStats);

// GET /api/reviews/verse/:verseId - Get reviews for a specific verse
router.get('/verse/:verseId', getReviewsByVerse);

// POST /api/reviews - Create a new review
router.post('/', createReview);

export default router;
