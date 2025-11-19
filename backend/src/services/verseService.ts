import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';
import { SpacedRepetitionService } from './spacedRepetition';

export class VerseService {
  async createVerse(data: {
    reference: string;
    text: string;
    translation?: string;
    userId: string;
  }) {
    if (!data.reference || !data.text) {
      throw new ValidationError('Reference and text are required');
    }

    const verse = await prisma.verse.create({
      data: {
        reference: data.reference,
        text: data.text,
        translation: data.translation || 'NIV',
        userId: data.userId,
        reviews: {
          create: {
            userId: data.userId,
            quality: 0,
            nextReviewAt: new Date(),
          },
        },
      },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return verse;
  }

  async getVerseById(id: string, userId: string) {
    const verse = await prisma.verse.findFirst({
      where: { id, userId },
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

    return verse;
  }

  async getVersesByUser(userId: string) {
    const verses = await prisma.verse.findMany({
      where: { userId },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return verses;
  }

  async getVersesDueForReview(userId: string) {
    const now = new Date();
    
    const verses = await prisma.verse.findMany({
      where: {
        userId,
        reviews: {
          some: {
            nextReviewAt: {
              lte: now,
            },
          },
        },
      },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return verses;
  }

  async updateVerse(
    id: string,
    userId: string,
    data: {
      reference?: string;
      text?: string;
      translation?: string;
    }
  ) {
    const verse = await this.getVerseById(id, userId);

    const updated = await prisma.verse.update({
      where: { id: verse.id },
      data,
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return updated;
  }

  async deleteVerse(id: string, userId: string) {
    const verse = await this.getVerseById(id, userId);

    await prisma.verse.delete({
      where: { id: verse.id },
    });

    return { message: 'Verse deleted successfully' };
  }

  async getVerseStats(userId: string) {
    const totalVerses = await prisma.verse.count({
      where: { userId },
    });

    const now = new Date();
    const versesDue = await prisma.verse.count({
      where: {
        userId,
        reviews: {
          some: {
            nextReviewAt: {
              lte: now,
            },
          },
        },
      },
    });

    const totalReviews = await prisma.review.count({
      where: { userId },
    });

    return {
      totalVerses,
      versesDue,
      totalReviews,
    };
  }
}
