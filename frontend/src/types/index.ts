export interface Verse {
  id: string;
  reference: string;
  text: string;
  translation: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  verseId: string;
  userId: string;
  quality: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: string;
  reviewedAt: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerseStats {
  totalVerses: number;
  versesDue: number;
  totalReviews: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageQuality: number;
  reviewsByDate: Record<string, { count: number; totalQuality: number }>;
  days: number;
}
