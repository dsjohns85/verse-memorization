/**
 * Spaced Repetition Algorithm (SM-2)
 * Based on SuperMemo 2 algorithm
 * 
 * Quality ratings:
 * 5 - perfect response
 * 4 - correct response after a hesitation
 * 3 - correct response recalled with serious difficulty
 * 2 - incorrect response; where the correct one seemed easy to recall
 * 1 - incorrect response; the correct one remembered
 * 0 - complete blackout
 */

export interface ReviewResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
}

export class SpacedRepetitionService {
  /**
   * Calculate next review based on quality rating
   * @param quality - Rating from 0-5
   * @param previousEaseFactor - Previous ease factor (default 2.5)
   * @param previousInterval - Previous interval in days (default 1)
   * @param previousRepetitions - Previous repetition count (default 0)
   * @returns ReviewResult with new ease factor, interval, and next review date
   */
  static calculateNextReview(
    quality: number,
    previousEaseFactor: number = 2.5,
    previousInterval: number = 1,
    previousRepetitions: number = 0
  ): ReviewResult {
    // Validate quality
    if (quality < 0 || quality > 5) {
      throw new Error('Quality must be between 0 and 5');
    }

    let easeFactor = previousEaseFactor;
    let interval = previousInterval;
    let repetitions = previousRepetitions;

    // If quality < 3, reset repetitions and interval
    if (quality < 3) {
      repetitions = 0;
      interval = 1;
    } else {
      // Update ease factor
      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

      // Ensure ease factor doesn't go below 1.3
      if (easeFactor < 1.3) {
        easeFactor = 1.3;
      }

      // Calculate new interval based on repetitions
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(previousInterval * easeFactor);
      }

      repetitions++;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
      easeFactor,
      interval,
      repetitions,
      nextReviewDate,
    };
  }

  /**
   * Get verses that are due for review
   * @param nextReviewDate - Date to check against
   * @returns boolean indicating if review is due
   */
  static isReviewDue(nextReviewDate: Date): boolean {
    return nextReviewDate <= new Date();
  }
}
