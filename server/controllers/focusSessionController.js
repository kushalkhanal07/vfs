import FocusSession from "../models/focusSessionModel.js";
import Note from "../models/noteModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

/**
 * CREATE A NEW FOCUS SESSION
 * POST /api/sessions/create
 */
export const createSession = async (req, res, next) => {
  try {
    const { subjects = [], duration = 25, mode = "revision" } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!["revision", "free-study", "mixed"].includes(mode)) {
      return res.status(400).json({ error: "Invalid session mode" });
    }

    if (duration < 1 || duration > 480) {
      return res.status(400).json({ error: "Duration must be between 1-480 minutes" });
    }

    // Fetch revision items (notes) based on mode and subjects
    let query = {
      userId,
      deleted: false,
      isArchived: false,
    };

    if (subjects.length > 0) {
      query.tags = { $in: subjects };
    }

    const items = await Note.find(query)
      .select("_id title content tags subject")
      .lean();

    if (items.length === 0) {
      return res.status(400).json({
        error: "No notes found for selected subjects",
        message: "Please create some notes first or select different subjects",
      });
    }

    // Create session with items
    const focusSession = await FocusSession.create({
      userId,
      subjects,
      mode,
      status: "setup",
      plannedDuration: duration,
      duration,
      items: items.map((item, index) => ({
        noteId: item._id,
        order: index,
        status: "pending",
        notTitle: item.title,
        noteSubject: item.tags[0] || "General",
      })),
      stats: {
        itemsCount: items.length,
        itemsReviewed: 0,
      },
    });

    await focusSession.populate("items.noteId", "title content tags");

    res.json({
      success: true,
      sessionId: focusSession._id,
      items: focusSession.items,
      startTime: new Date(),
      itemsCount: items.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET SESSION DETAILS
 * GET /api/sessions/:id
 */
export const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const session = await FocusSession.findOne({
      _id: id,
      userId,
    }).populate("items.noteId", "title content tags");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (err) {
    next(err);
  }
};

/**
 * GET CURRENT ITEM TO STUDY
 * GET /api/sessions/:id/current-item
 */
export const getCurrentItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await FocusSession.findOne({
      _id: id,
      userId,
    }).populate("items.noteId", "title content tags");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Find first pending or in-progress item
    const currentItem = session.items.find(
      (item) => item.status === "pending" || item.status === "in-progress"
    );

    if (!currentItem) {
      return res.status(200).json({ message: "All items completed", item: null });
    }

    // Mark as in-progress if pending
    if (currentItem.status === "pending") {
      currentItem.status = "in-progress";
      await session.save();
    }

    res.json({
      item: currentItem,
      itemIndex: session.items.findIndex((i) => i._id === currentItem._id),
      totalItems: session.items.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * RATE AN ITEM (Spaced Repetition)
 * POST /api/sessions/:id/rate-item
 */
export const rateItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { itemId, rating, timeSpent } = req.body;
    const userId = req.user._id;

    // Validate rating (1-4: Again/Hard/Good/Easy)
    if (![1, 2, 3, 4].includes(rating)) {
      return res.status(400).json({ error: "Rating must be 1-4" });
    }

    const session = await FocusSession.findOne({
      _id: id,
      userId,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status === "complete") {
      return res.status(400).json({ error: "Cannot rate items in completed session" });
    }

    const item = session.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found in session" });
    }

    // Update item
    item.rating = rating;
    item.timeSpent = timeSpent || 0;
    item.status = "completed";
    item.ratedAt = new Date();

    // Update session stats
    session.stats.itemsReviewed = session.items.filter(
      (i) => i.status === "completed"
    ).length;

    // Calculate average confidence (1-4 rating mapped to 0-100%)
    // 1 (Again) = 0%, 2 (Hard) = 33%, 3 (Good) = 66%, 4 (Easy) = 100%
    const ratings = session.items
      .filter((i) => i.rating)
      .map((i) => ((i.rating - 1) / 3) * 100);
    session.stats.avgConfidence =
      ratings.length > 0 ? Math.round(ratings.reduce((a, b) => a + b) / ratings.length) : 0;

    session.stats.totalTimeSpent = session.items.reduce(
      (sum, i) => sum + (i.timeSpent || 0),
      0
    );

    // Track weak items (rated 1 or 2)
    if (rating <= 2) {
      if (!session.weakItems.includes(item.noteId)) {
        session.weakItems.push(item.noteId);
      }
    }

    await session.save();

    res.json({
      success: true,
      item,
      stats: session.stats,
      nextReviewDate: calculateNextReviewDate(rating),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PAUSE SESSION
 * PATCH /api/sessions/:id/pause
 */
export const pauseSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await FocusSession.findOne({
      _id: id,
      userId,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status !== "active") {
      return res.status(400).json({ error: "Session is not active" });
    }

    session.status = "paused";
    session.pausedAt = new Date();
    await session.save();

    res.json({ success: true, status: "paused" });
  } catch (err) {
    next(err);
  }
};

/**
 * RESUME SESSION
 * PATCH /api/sessions/:id/resume
 */
export const resumeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await FocusSession.findOne({
      _id: id,
      userId,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status !== "paused") {
      return res.status(400).json({ error: "Session is not paused" });
    }

    // Calculate paused duration
    if (session.pausedAt) {
      const pausedDuration = Date.now() - session.pausedAt.getTime();
      session.totalPausedTime += pausedDuration;
    }

    session.status = "active";
    session.pausedAt = null;
    await session.save();

    res.json({ success: true, status: "active" });
  } catch (err) {
    next(err);
  }
};

/**
 * COMPLETE SESSION
 * POST /api/sessions/:id/complete
 */
export const completeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await FocusSession.findOne({
      _id: id,
      userId,
    }).populate("items.noteId");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status === "complete") {
      return res.status(400).json({ error: "Session already completed" });
    }

    // Mark session as complete
    session.endTime = new Date();
    session.status = "complete";

    // Calculate session duration
    const actualDuration = Math.round(
      (session.endTime - session.startTime - session.totalPausedTime) / 1000 / 60
    );

    // Calculate mastery delta (improvement)
    const avgConfidence = session.stats.avgConfidence;
    const masteryDelta = Math.round(avgConfidence / 10); // Scale from 0-100 to 0-10
    session.stats.masteryDelta = masteryDelta;

    // Update user stats (optional: update streak, mastery, etc.)
    const user = await User.findById(userId);
    if (user) {
      // You can add streak tracking here if needed
    }

    // Build next review dates
    const nextReviewDates = new Map();
    session.items.forEach((item) => {
      if (item.rating) {
        nextReviewDates.set(
          item.noteId._id.toString(),
          calculateNextReviewDate(item.rating)
        );
      }
    });
    session.nextReviewDates = nextReviewDates;

    await session.save();

    // Build detailed response
    const itemBreakdown = session.items.map((item) => ({
      topic: item.notTitle,
      subject: item.noteSubject,
      rating: getRatingLabel(item.rating),
      nextReview: nextReviewDates.get(item.noteId._id.toString()),
    }));

    res.json({
      success: true,
      sessionComplete: {
        duration: actualDuration,
        itemsReviewed: session.stats.itemsReviewed,
        totalItems: session.stats.itemsCount,
        avgConfidence: session.stats.avgConfidence,
        masteryDelta: session.stats.masteryDelta,
        weakItems: session.weakItems.length,
        streakUpdated: true,
        itemBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET SESSION HISTORY
 * GET /api/sessions/history?limit=10&skip=0
 */
export const getSessionHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = parseInt(req.query.skip) || 0;

    const sessions = await FocusSession.find({
      userId,
      status: "complete",
    })
      .sort({ endTime: -1 })
      .limit(limit)
      .skip(skip)
      .select("_id subjects mode duration stats startTime endTime");

    const total = await FocusSession.countDocuments({
      userId,
      status: "complete",
    });

    res.json({
      sessions,
      total,
      limit,
      skip,
    });
  } catch (err) {
    next(err);
  }
};

// HELPER FUNCTIONS

function calculateNextReviewDate(rating) {
  const today = new Date();
  const days =
    {
      1: 1, // Again - retry tomorrow
      2: 3, // Hard - 3 days
      3: 7, // Good - 7 days
      4: 14, // Easy - 14 days
    }[rating] || 1;

  const nextDate = new Date(today);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getRatingLabel(rating) {
  return {
    1: "Again ❌",
    2: "Hard 😐",
    3: "Good 🙂",
    4: "Easy 😄",
  }[rating] || "Unknown";
}

/**
 * START SESSION (move from setup to active)
 * PATCH /api/sessions/:id/start
 */
export const startSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await FocusSession.findOne({
      _id: id,
      userId,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.status !== "setup") {
      return res.status(400).json({ error: "Session has already started or is complete" });
    }

    session.status = "active";
    session.startTime = new Date();
    await session.save();

    res.json({ success: true, status: "active", startTime: session.startTime });
  } catch (err) {
    next(err);
  }
};
