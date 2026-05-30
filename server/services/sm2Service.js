/**
 * SM-2 (Spaced Repetition Algorithm 2)
 * Based on the Super-Memo algorithm for optimal learning intervals
 */

export class SM2Service {
  /**
   * Calculate next review date and update SM-2 parameters
   * @param {number} quality - User's rating of difficulty (0-5)
   * @param {number} currentEaseFactor - Current ease factor
   * @param {number} repetitionCount - Number of times reviewed
   * @param {number} currentInterval - Current interval in days
   * @returns {Object} Updated SM-2 parameters
   */
  static calculateNextReview(quality, currentEaseFactor, repetitionCount, currentInterval) {
    if (quality < 0 || quality > 5) {
      throw new Error("Quality must be between 0 and 5");
    }

    let newEaseFactor = currentEaseFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);

    // Minimum ease factor is 1.3
    newEaseFactor = Math.max(1.3, newEaseFactor);

    let newInterval;
    let newRepetitionCount = repetitionCount + 1;

    if (quality < 3) {
      // Failed review - reset
      newInterval = 1;
      newRepetitionCount = 1;
    } else {
      // Successful review
      if (repetitionCount === 0) {
        newInterval = 1;
      } else if (repetitionCount === 1) {
        newInterval = 3;
      } else {
        newInterval = Math.round(currentInterval * newEaseFactor);
      }
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    return {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitionCount: newRepetitionCount,
      nextReviewDate,
      difficulty: 5 - quality, // Store difficulty for analytics
    };
  }

  /**
   * Get review statistics for a user
   */
  static calculateStats(reviewHistory) {
    if (!reviewHistory || reviewHistory.length === 0) {
      return {
        totalReviews: 0,
        averageQuality: 0,
        successRate: 0,
        averageTimeSpent: 0,
      };
    }

    const totalReviews = reviewHistory.length;
    const successfulReviews = reviewHistory.filter((r) => r.reviewScore >= 3).length;
    const totalTimeSpent = reviewHistory.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
    const avgQuality = reviewHistory.reduce((sum, r) => sum + r.reviewScore, 0) / totalReviews;

    return {
      totalReviews,
      averageQuality: Math.round(avgQuality * 100) / 100,
      successRate: Math.round((successfulReviews / totalReviews) * 100),
      averageTimeSpent: Math.round(totalTimeSpent / totalReviews),
    };
  }
}

export default SM2Service;
