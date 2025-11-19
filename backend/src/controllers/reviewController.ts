import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ReviewService } from '../services/reviewService';

const reviewService = new ReviewService();

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { verseId, quality } = req.body;
    const userId = req.user!.id;

    const review = await reviewService.createReview({
      verseId,
      userId,
      quality,
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const getReviewsByVerse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { verseId } = req.params;
    const userId = req.user!.id;

    const reviews = await reviewService.getReviewsByVerse(verseId, userId);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

export const getReviewHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const reviews = await reviewService.getReviewHistory(userId, limit);
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

export const getReviewStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const stats = await reviewService.getReviewStats(userId, days);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
