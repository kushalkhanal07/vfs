/**
 * Revision Controller - SM-2 spaced repetition system
 */

import RevisionSchedule from "../models/revisionScheduleModel.js";
import RevisionHistory from "../models/revisionHistoryModel.js";
import Note from "../models/noteModel.js";
import File from "../models/fileModel.js";
import Directory from "../models/directoryModel.js";
import { createNotification } from "./notificationController.js";
import { SM2Service } from "../services/sm2Service.js";

// ADD CONTENT TO REVISION
export const addToRevision = async (req, res, next) => {
  try {
    const { contentId, contentType, priority = "Medium" } = req.body;
    const userId = req.user._id;

    if (!["note", "file", "folder"].includes(contentType)) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    // Verify content ownership
    let content;
    if (contentType === "note") {
      content = await Note.findOne({ _id: contentId, userId });
    } else if (contentType === "file") {
      content = await File.findOne({ _id: contentId, userId });
    } else {
      content = await Directory.findOne({ _id: contentId, userId });
    }

    if (!content) {
      return res.status(404).json({ error: "Content not found or unauthorized" });
    }

    // Check if already in revision
    const existing = await RevisionSchedule.findOne({ userId, contentId, contentType });
    if (existing) {
      return res.status(400).json({ error: "Already added to revisions" });
    }

    const nextReviewDate = new Date();

    const schedule = await RevisionSchedule.create({
      userId,
      contentId,
      contentType,
      priority,
      nextReviewDate,
    });

    // Create notification (DB + emit)
    await createNotification(
      userId,
      "Added to Revisions",
      `Content added to your revision queue`,
      "learning_recommendation",
      { contentId, contentType }
    );

    res.status(201).json({ message: "Added to revision", schedule });
  } catch (err) {
    next(err);
  }
};

// SUBMIT REVIEW
export const submitReview = async (req, res, next) => {
  try {
    const { scheduleId, reviewScore, timeSpent = 0, notes = "" } = req.body;
    const userId = req.user._id;

    if (reviewScore < 0 || reviewScore > 5) {
      return res.status(400).json({ error: "Review score must be 0-5" });
    }

    const schedule = await RevisionSchedule.findOne({ _id: scheduleId, userId });

    if (!schedule) {
      return res.status(404).json({ error: "Revision schedule not found" });
    }

    // Calculate SM-2 parameters
    const nextParams = SM2Service.calculateNextReview(
      reviewScore,
      schedule.easeFactor,
      schedule.repetitionCount,
      schedule.interval
    );

    // Create history record
    const history = await RevisionHistory.create({
      userId,
      revisionScheduleId: scheduleId,
      contentId: schedule.contentId,
      contentType: schedule.contentType,
      reviewScore,
      timeSpent,
      notes,
      nextEaseFactor: nextParams.easeFactor,
      nextInterval: nextParams.interval,
      nextRepetitionCount: nextParams.repetitionCount,
    });

    // Update schedule
    schedule.easeFactor = nextParams.easeFactor;
    schedule.interval = nextParams.interval;
    schedule.repetitionCount = nextParams.repetitionCount;
    schedule.nextReviewDate = nextParams.nextReviewDate;
    schedule.lastReviewDate = new Date();
    schedule.difficulty = nextParams.difficulty;

    // Determine if review was successful
    if (reviewScore >= 3) {
      schedule.dueToday = false;
    } else {
      schedule.dueToday = true; // Retry today if failed
    }

    await schedule.save();

    // Log analytics activity (attempt to derive subject when possible)
    try {
      let subject = null;
      if (schedule.contentType === "note") {
        const Note = (await import("../models/noteModel.js")).default;
        const note = await Note.findById(schedule.contentId).select("tags").lean();
        if (note && Array.isArray(note.tags) && note.tags.length > 0) subject = note.tags[0];
      }

      const AnalyticsService = (await import("../services/analyticsService.js")).default;
      await AnalyticsService.logActivity({ userId, activityType: "revision_complete", activityCount: 1, duration: timeSpent, subject });
    } catch (e) {
      console.error("Failed to log analytics for revision completion", e);
    }

    res.json({
      message: "Review submitted",
      history,
      nextSchedule: schedule,
    });
  } catch (err) {
    next(err);
  }
};

// GET TODAY'S REVISIONS
export const getTodayRevisions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const revisions = await RevisionSchedule.find({
      userId,
      isActive: true,
      nextReviewDate: { $lte: new Date() },
    }).sort({ priority: 1 });

    // Get content details
    const populated = await Promise.all(
      revisions.map(async (rev) => {
        let content = null;
        if (rev.contentType === "note") {
          content = await Note.findById(rev.contentId).select("title tags").lean();
        } else if (rev.contentType === "file") {
          content = await File.findById(rev.contentId).select("name").lean();
        } else {
          content = await Directory.findById(rev.contentId).select("name").lean();
        }
        return { ...rev.toObject(), content };
      })
    );

    res.json({ revisions: populated, count: populated.length });
  } catch (err) {
    next(err);
  }
};

// GET UPCOMING REVISIONS
export const getUpcomingRevisions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    const revisions = await RevisionSchedule.find({
      userId,
      isActive: true,
      nextReviewDate: { $gte: startDate, $lte: endDate },
    })
      .sort({ nextReviewDate: 1 })
      .limit(100);

    // Group by date
    const grouped = {};
    revisions.forEach((rev) => {
      const date = rev.nextReviewDate.toISOString().split("T")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(rev);
    });

    res.json({ grouped });
  } catch (err) {
    next(err);
  }
};

// GET REVISION HISTORY
export const getRevisionHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 50;

    const history = await RevisionHistory.find({ userId })
      .sort({ reviewDate: -1 })
      .limit(limit)
      .lean();

    res.json({ history, count: history.length });
  } catch (err) {
    next(err);
  }
};

// GET REVISION STATS
export const getRevisionStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [activeRevisions, completedRevisions, history] = await Promise.all([
      RevisionSchedule.countDocuments({ userId, isActive: true }),
      RevisionSchedule.countDocuments({ userId, isActive: false }),
      RevisionHistory.find({ userId }).lean(),
    ]);

    const stats = SM2Service.calculateStats(history);

    res.json({
      activeRevisions,
      completedRevisions,
      stats,
    });
  } catch (err) {
    next(err);
  }
};

// REMOVE FROM REVISION
export const removeFromRevision = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const userId = req.user._id;

    const schedule = await RevisionSchedule.findOneAndUpdate(
      { _id: scheduleId, userId },
      { isActive: false },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ message: "Removed from revisions" });
  } catch (err) {
    next(err);
  }
};
