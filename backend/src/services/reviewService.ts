import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';
import { SpacedRepetitionService } from './spacedRepetition';
import { Review } from '@prisma/client';

type ReviewWithQuality = Pick<Review, 'quality' | 'createdAt'>;

export class ReviewService {
  async createReview(data: {
    verseId: string;
    userId: string;
    quality: number;
  }) {
    if (data.quality < 0 || data.quality > 5) {
      throw new ValidationError('Quality must be between 0 and 5');
    }

    // Verify verse exists and belongs to user
    const verse = await prisma.verse.findFirst({
      where: {
        id: data.verseId,
        userId: data.userId,
      },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!verse) {
      throw new NotFoundError('Verse not found');
    }

    // Get previous review data
    const lastReview = verse.reviews[0];
    const previousEaseFactor = lastReview?.easeFactor || 2.5;
    const previousInterval = lastReview?.interval || 1;
    const previousRepetitions = lastReview?.repetitions || 0;

    // Calculate next review using spaced repetition
    const result = SpacedRepetitionService.calculateNextReview(
      data.quality,
      previousEaseFactor,
      previousInterval,
      previousRepetitions
    );

    // Create new review
    const review = await prisma.review.create({
      data: {
        verseId: data.verseId,
        userId: data.userId,
        quality: data.quality,
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReviewAt: result.nextReviewDate,
      },
      include: {
        verse: true,
      },
    });

    return review;
  }

  async getReviewsByVerse(verseId: string, userId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        verseId,
        userId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        verse: true,
      },
    });

    return reviews;
  }

  async getReviewHistory(userId: string, limit: number = 50) {
    const reviews = await prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        verse: {
          select: {
            id: true,
            reference: true,
            text: true,
          },
        },
      },
    });

    return reviews;
  }

  async getReviewStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reviews = await prisma.review.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate stats
    const totalReviews = reviews.length;
    const averageQuality = totalReviews > 0
      ? reviews.reduce((sum: number, r: ReviewWithQuality) => sum + r.quality, 0) / totalReviews
      : 0;

    // Group by date
    const reviewsByDate = reviews.reduce((acc: Record<string, { count: number; totalQuality: number }>, review: ReviewWithQuality) => {
      const date = review.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, totalQuality: 0 };
      }
      acc[date].count++;
      acc[date].totalQuality += review.quality;
      return acc;
    }, {} as Record<string, { count: number; totalQuality: number }>);

    return {
      totalReviews,
      averageQuality: Math.round(averageQuality * 10) / 10,
      reviewsByDate,
      days,
    };
  }
}
