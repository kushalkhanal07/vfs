/**
 * Dashboard Service - Aggregations and statistics
 */

import Note from "../models/noteModel.js";
import RevisionSchedule from "../models/revisionScheduleModel.js";
import RevisionHistory from "../models/revisionHistoryModel.js";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";
import ActivityLog from "../models/activityLogModel.js";
import AnalyticsService from "./analyticsService.js";

export class DashboardService {
  /**
   * Get comprehensive dashboard overview for a user
   */
  static async getDashboardOverview(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [user, totalNotes, totalArchived, totalFavorites, totalFolders, totalFiles, todayRevisions, upcomingRevisions] =
      await Promise.all([
        User.findById(userId).select("name email picture role").lean(),
        Note.countDocuments({ userId, deleted: false, isArchived: false }),
        Note.countDocuments({ userId, deleted: false, isArchived: true }),
        Note.countDocuments({ userId, deleted: false, isFavorite: true }),
        Directory.countDocuments({ userId, deleted: false }),
        File.countDocuments({ userId, deleted: false }),
        RevisionSchedule.countDocuments({ userId, dueToday: true, isActive: true }),
        RevisionSchedule.countDocuments({
          userId,
          nextReviewDate: { $gt: today },
          isActive: true,
        }),
      ]);

    return {
      user,
      stats: {
        totalNotes,
        totalArchived,
        totalFavorites,
        totalFolders,
        totalFiles,
        todayRevisions,
        upcomingRevisions,
      },
    };
  }

  /**
   * Quick metrics used on top-level dashboard cards
   * Returns: { studyStreak, notesCreatedThisMonth, hoursFocusedThisWeek, masteryScore }
   */
  static async getQuickMetrics(userId) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Notes created this month
      const notesCreatedThisMonth = await Note.countDocuments({ userId, deleted: false, createdAt: { $gte: startOfMonth } });

      // Hours focused in last 7 days (sum durations from ActivityLog where type is study_session_create/start)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const agg = await ActivityLog.aggregate([
        { $match: { userId, activityType: { $in: ["study_session_create", "study_session_start"] }, createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, totalDuration: { $sum: "$duration" } } },
      ]).exec();

      const totalSeconds = (agg[0] && agg[0].totalDuration) || 0;
      const hoursFocusedThisWeek = Math.round((totalSeconds / 3600) * 10) / 10;

      // Study streak
      const streakObj = await this.getStudyStreak(userId);
      const studyStreak = streakObj.currentStreak || 0;

      // Mastery score: average mastery across subjects
      let masteryScore = 0;
      try {
        const subjects = await AnalyticsService.getSubjectMastery(userId);
        if (Array.isArray(subjects) && subjects.length > 0) {
          const sum = subjects.reduce((s, x) => s + (x.mastery || 0), 0);
          masteryScore = Math.round(sum / subjects.length);
        }
      } catch (err) {
        // ignore analytics errors
        masteryScore = 0;
      }

      return { studyStreak, notesCreatedThisMonth, hoursFocusedThisWeek, masteryScore };
    } catch (err) {
      console.error("DashboardService.getQuickMetrics error:", err);
      return { studyStreak: 0, notesCreatedThisMonth: 0, hoursFocusedThisWeek: 0, masteryScore: 0 };
    }
  }

  /**
   * Get study streak for user
   */
  static async getStudyStreak(userId) {
    const revisionHistory = await RevisionHistory.find({ userId })
      .sort({ reviewDate: -1 })
      .lean();

    if (revisionHistory.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    for (const review of revisionHistory) {
      const reviewDate = new Date(review.reviewDate);
      reviewDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        tempStreak = 1;
        currentStreak = 1;
        lastDate = reviewDate;
      } else {
        const diffTime = Math.abs(lastDate - reviewDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }

        lastDate = reviewDate;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    currentStreak = tempStreak;

    return { currentStreak, longestStreak };
  }

  /**
   * Get recent notes
   */
  static async getRecentNotes(userId, limit = 5) {
    return await Note.find({
      userId,
      deleted: false,
      isArchived: false,
    })
      .select("_id title tags lastEditedAt")
      .sort({ lastEditedAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get recent files
   */
  static async getRecentFiles(userId, limit = 5) {
    return await File.find({ userId, deleted: false })
      .select("_id name createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get revision summary
   */
  static async getRevisionSummary(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [completed, pending, high, medium, low] = await Promise.all([
      RevisionSchedule.countDocuments({ userId, isActive: false }),
      RevisionSchedule.countDocuments({ userId, isActive: true, nextReviewDate: { $lte: today } }),
      RevisionSchedule.countDocuments({
        userId,
        isActive: true,
        priority: "High",
      }),
      RevisionSchedule.countDocuments({
        userId,
        isActive: true,
        priority: "Medium",
      }),
      RevisionSchedule.countDocuments({
        userId,
        isActive: true,
        priority: "Low",
      }),
    ]);

    return {
      completed,
      pending,
      byPriority: { high, medium, low },
    };
  }

  /**
   * Get activity summary (last 7 days)
   */
  static async getActivitySummary(userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [notesCreated, notesEdited, filesUploaded, revisionsCompleted] = await Promise.all([
      Note.countDocuments({
        userId,
        deleted: false,
        createdAt: { $gte: sevenDaysAgo },
      }),
      Note.countDocuments({
        userId,
        deleted: false,
        updatedAt: { $gte: sevenDaysAgo },
      }),
      File.countDocuments({
        userId,
        deleted: false,
        createdAt: { $gte: sevenDaysAgo },
      }),
      RevisionHistory.countDocuments({
        userId,
        reviewDate: { $gte: sevenDaysAgo },
      }),
    ]);

    return {
      notesCreated,
      notesEdited,
      filesUploaded,
      revisionsCompleted,
    };
  }

  /**
   * Get learning recommendations based on activity
   */
  static async getLearningRecommendations(userId) {
    const [lowScoreRevisions, staledNotes, unvisitedNotes] = await Promise.all([
      RevisionHistory.find({ userId, reviewScore: { $lt: 3 } })
        .sort({ createdAt: -1 })
        .limit(3)
        .select("contentId")
        .lean(),
      Note.find({
        userId,
        deleted: false,
        lastEditedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      })
        .limit(3)
        .select("_id title")
        .lean(),
      Note.find({
        userId,
        deleted: false,
        lastEditedAt: { $lt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
      })
        .limit(2)
        .select("_id title")
        .lean(),
    ]);

    return {
      reviewAgain: lowScoreRevisions,
      oldNotes: staledNotes,
      unvisitedNotes,
    };
  }
}

export default DashboardService;
