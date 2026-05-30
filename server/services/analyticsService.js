import ActivityLog from "../models/activityLogModel.js";
import SubjectProgress from "../models/subjectProgressModel.js";
import RevisionSession from "../models/revisionSessionModel.js";
import { startOfDay } from "../utils/dateUtils.js";

export class AnalyticsService {
  /**
   * Log an activity for analytics
   */
  static async logActivity({ userId, activityType, activityCount = 1, duration = 0, subject = null, meta = {} }) {
    try {
      const entry = await ActivityLog.create({ userId, activityType, activityCount, duration, subject, meta });

      // Optionally update subject progress for revision completions
      if (activityType === "revision_complete" && subject) {
        await this._updateSubjectProgressOnReview(userId, subject, activityCount);
      }

      return entry;
    } catch (err) {
      console.error("AnalyticsService.logActivity error:", err);
      throw err;
    }
  }

  static async _updateSubjectProgressOnReview(userId, subject, count = 1) {
    try {
      const filter = { userId, subject };
      const doc = await SubjectProgress.findOne(filter);
      if (doc) {
        doc.totalReviews = (doc.totalReviews || 0) + count;
        doc.successfulReviews = (doc.successfulReviews || 0) + count; // assuming logged only on success
        doc.mastery = Math.round(((doc.successfulReviews || 0) / (doc.totalReviews || 1)) * 100);
        await doc.save();
      } else {
        const total = count;
        const successful = count;
        await SubjectProgress.create({ userId, subject, successfulReviews: successful, totalReviews: total, mastery: Math.round((successful / total) * 100) });
      }
    } catch (err) {
      console.error("Failed to update subject progress:", err);
    }
  }

  /**
   * Compute subject mastery using RevisionSession aggregation
   * Fallback: calculates mastery based on RevisionSession.status
   */
  static async getSubjectMastery(userId) {
    // Aggregate by subject from RevisionSession
    const pipeline = [
      { $match: { user: userId } },
      {
        $group: {
          _id: "$subject",
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          subject: "$_id",
          mastery: {
            $cond: [{ $eq: ["$total", 0] }, 0, { $round: [{ $multiply: [{ $divide: ["$completed", "$total"] }, 100] }, 0] }],
          },
          total: 1,
          completed: 1,
        },
      },
      { $sort: { mastery: -1, subject: 1 } },
    ];

    const res = await RevisionSession.aggregate(pipeline).exec();

    // return in expected format
    return res.map((r) => ({ subject: r.subject || "General", mastery: r.mastery }));
  }

  /**
   * Activity heatmap data for last N days (default 84 days / 12 weeks)
   */
  static async getActivityHeatmap(userId, days = 84) {
    const startDate = startOfDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));

    const pipeline = [
      { $match: { userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: "$activityCount" },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1 } },
      { $sort: { date: 1 } },
    ];

    const rows = await ActivityLog.aggregate(pipeline).exec();

    return rows; // [{date,count}, ...]
  }
}

export default AnalyticsService;
