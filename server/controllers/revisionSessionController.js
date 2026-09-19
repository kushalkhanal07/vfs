import RevisionSession from "../models/revisionSessionModel.js";
import { createNotification } from "./notificationController.js";
import {
  buildScheduledAt,
  getRevisionSessionsForUser,
  isValidRevisionTime,
  startOfDay,
  normalizeRevisionSessionPayload,
} from "../services/revisionSessionService.js";
import { scheduleRevisionReminder, clearRevisionReminder } from "../services/revisionReminder.queue.js";

const allowedPriorities = new Set(["High", "Medium", "Low"]);

const buildSessionResponse = (session) => ({
  ...session,
  scheduledAt: buildScheduledAt(session),
});

const validatePayload = (payload) => {
  const errors = [];
  const today = startOfDay(new Date());

  if (!payload.title) errors.push("title is required");
  if (!payload.subject) errors.push("subject is required");
  if (!payload.revisionDate || Number.isNaN(payload.revisionDate.getTime())) {
    errors.push("revisionDate is required");
  } else if (payload.revisionDate < today) {
    errors.push("revisionDate cannot be in the past");
  }
  if (!payload.revisionTime) errors.push("revisionTime is required");
  if (payload.revisionTime && !isValidRevisionTime(payload.revisionTime)) {
    errors.push("revisionTime must be in HH:MM format");
  }
  if (!Number.isFinite(payload.duration) || payload.duration < 5) {
    errors.push("duration must be at least 5 minutes");
  }
  if (payload.priority && !allowedPriorities.has(payload.priority)) {
    errors.push("priority must be High, Medium, or Low");
  }

  return errors;
};

export const createRevisionSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const normalized = normalizeRevisionSessionPayload(req.body);
    const errors = validatePayload(normalized);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], details: errors });
    }

    const session = await RevisionSession.create({
      user: userId,
      title: normalized.title,
      description: normalized.description,
      subject: normalized.subject,
      revisionDate: normalized.revisionDate,
      revisionTime: normalized.revisionTime,
      duration: normalized.duration,
      priority: normalized.priority,
      difficulty: normalized.difficulty,
      tags: normalized.tags,
      reminderEnabled: normalized.reminderEnabled,
      reminderInterval: normalized.reminderEnabled ? normalized.reminderInterval ?? 10 : null,
      examBoost: normalized.examBoost,
      examDate: normalized.examDate,
      status: "scheduled",
    });

    // Create a notification if the user requested a reminder
    let createdNotification = null;
    if (normalized.reminderEnabled) {
      try {
        createdNotification = await createNotification(
          userId,
          "Revision reminder scheduled",
          `Your session "${normalized.title}" is scheduled for ${normalized.revisionDate.toDateString()} at ${normalized.revisionTime}.`,
          "revision_reminder",
          { sessionId: session._id }
        );
      } catch (e) {
        // log and continue; notification failure should not block session creation
        console.error("Failed to create session reminder notification:", e);
      }
    }

    // Schedule server-side reminder (non-blocking)
    try {
      await scheduleRevisionReminder(session);
    } catch (e) {
      console.error("Failed to schedule revision reminder:", e);
    }

    // Log analytics activity for creating a revision session
    try {
      const AnalyticsService = (await import("../services/analyticsService.js")).default;
      await AnalyticsService.logActivity({ userId, activityType: "revision_session_create", activityCount: 1, duration: session.duration, subject: session.subject });
    } catch (e) {
      console.error("Failed to log analytics for revision session create", e);
    }

    return res.status(201).json({
      message: "Revision session created",
      session: buildSessionResponse(session.toObject()),
      notification: createdNotification ? (createdNotification.toObject ? createdNotification.toObject() : createdNotification) : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getRevisionSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const status = req.query.status || undefined;
    const from = req.query.from ? new Date(req.query.from) : undefined;
    const to = req.query.to ? new Date(req.query.to) : undefined;

    const sessions = await getRevisionSessionsForUser(userId, { status, from, to });
    const now = new Date();
    const todayKey = now.toISOString().split("T")[0];

    const normalized = sessions.map((session) => ({
      ...session,
      scheduledAt: buildScheduledAt(session),
    }));

    const todaySessions = normalized.filter(
      (session) => session.revisionDate.toISOString().split("T")[0] === todayKey
    );
    const upcomingSessions = normalized.filter((session) => {
      const sessionDate = new Date(session.revisionDate);
      sessionDate.setHours(0, 0, 0, 0);
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return sessionDate > today;
    });

    return res.json({
      sessions: normalized,
      todaySessions,
      upcomingSessions,
      count: normalized.length,
    });
  } catch (error) {
    next(error);
  }
};

export const listRevisionSessions = async (req, res, next) => {
  return getRevisionSessions(req, res, next);
};

export const getRevisionSessionById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const session = await RevisionSession.findOne({ _id: req.params.id, user: userId }).lean();

    if (!session) {
      return res.status(404).json({ error: "Revision session not found" });
    }

    return res.json({ session: buildSessionResponse(session) });
  } catch (error) {
    next(error);
  }
};

export const updateRevisionSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const existing = await RevisionSession.findOne({ _id: req.params.id, user: userId });

    if (!existing) {
      return res.status(404).json({ error: "Revision session not found" });
    }

    const prevReminderEnabled = existing.reminderEnabled;

    const normalized = normalizeRevisionSessionPayload({
      title: req.body.title ?? existing.title,
      description: req.body.description ?? existing.description,
      subject: req.body.subject ?? existing.subject,
      revisionDate: req.body.revisionDate ?? existing.revisionDate,
      revisionTime: req.body.revisionTime ?? existing.revisionTime,
      duration: req.body.duration ?? existing.duration,
      priority: req.body.priority ?? existing.priority,
      difficulty: req.body.difficulty ?? existing.difficulty,
      tags: req.body.tags ?? existing.tags,
      reminderEnabled: req.body.reminderEnabled ?? existing.reminderEnabled,
      reminderInterval: req.body.reminderInterval ?? existing.reminderInterval,
      examBoost: req.body.examBoost ?? existing.examBoost,
      // "in" check so the client can clear the exam date by sending null
      examDate: "examDate" in req.body ? req.body.examDate : existing.examDate,
    });

    const errors = validatePayload(normalized);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], details: errors });
    }

    existing.title = normalized.title;
    existing.description = normalized.description;
    existing.subject = normalized.subject;
    existing.revisionDate = normalized.revisionDate;
    existing.revisionTime = normalized.revisionTime;
    existing.duration = normalized.duration;
    existing.priority = normalized.priority;
    existing.difficulty = normalized.difficulty;
    existing.tags = normalized.tags;
    existing.reminderEnabled = normalized.reminderEnabled;
    existing.reminderInterval = normalized.reminderEnabled ? normalized.reminderInterval ?? existing.reminderInterval ?? 10 : null;
    existing.examBoost = normalized.examBoost;
    existing.examDate = normalized.examDate;

    await existing.save();

    // Reschedule or clear reminder based on updated settings
    try {
      if (existing.reminderEnabled) {
        await scheduleRevisionReminder(existing);
      } else {
        clearRevisionReminder(existing._id);
      }
    } catch (e) {
      console.error("Failed to reschedule revision reminder on update:", e);
    }

    // If status changed to completed, log analytics
    try {
      const newStatus = req.body.status ?? existing.status;
      if (newStatus === "completed" && existing.status !== "completed") {
        const AnalyticsService = (await import("../services/analyticsService.js")).default;
        await AnalyticsService.logActivity({ userId: existing.user, activityType: "revision_session_complete", activityCount: 1, duration: existing.duration, subject: existing.subject });
      }
    } catch (e) {
      console.error("Failed to log analytics for revision session update", e);
    }

    // If reminder was turned on in an update, create a notification
    let createdNotification = null;
    if (!prevReminderEnabled && normalized.reminderEnabled) {
      try {
        createdNotification = await createNotification(
          userId,
          "Revision reminder scheduled",
          `Your session "${normalized.title}" is scheduled for ${normalized.revisionDate.toDateString()} at ${normalized.revisionTime}.`,
          "revision_reminder",
          { sessionId: existing._id }
        );
      } catch (e) {
        console.error("Failed to create session reminder notification on update:", e);
      }
    }

    return res.json({
      message: "Revision session updated",
      session: buildSessionResponse(existing.toObject()),
      notification: createdNotification ? (createdNotification.toObject ? createdNotification.toObject() : createdNotification) : null,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRevisionSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const session = await RevisionSession.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { status: "cancelled" },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ error: "Revision session not found" });
    }

    // Clear any scheduled reminders for this session
    try {
      clearRevisionReminder(session._id);
    } catch (e) {
      console.error("Failed to clear revision reminder on delete:", e);
    }

    return res.json({ message: "Revision session deleted", session: buildSessionResponse(session.toObject()) });
  } catch (error) {
    next(error);
  }
};
