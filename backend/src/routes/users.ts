import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getCurrentUser, updateUser } from '../controllers/userController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users/me - Get current user
router.get('/me', getCurrentUser);

// PUT /api/users/me - Update current user
router.put('/me', updateUser);

export default router;
