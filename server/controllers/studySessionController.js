import StudySession from "../models/studySessionModel.js";
import Note from "../models/noteModel.js";

// GET week sessions starting from startDate (YYYY-MM-DD) or today
export const getWeekSessions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { start } = req.query; // optional YYYY-MM-DD

    const startDate = start ? new Date(start) : new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const sessions = await StudySession.find({
      userId,
      isCancelled: false,
      startDate: { $gte: startDate, $lt: endDate },
    })
      .sort({ startDate: 1 })
      .lean();

    // Optionally populate note titles if contentType === 'note'
    const populated = await Promise.all(
      sessions.map(async (s) => {
        if (s.contentType === "note" && s.contentId) {
          const note = await Note.findById(s.contentId).select("title").lean();
          return { ...s, contentTitle: note?.title || null };
        }
        return s;
      })
    );

    // Group by ISO date
    const grouped = {};
    populated.forEach((s) => {
      const key = new Date(s.startDate).toISOString().split("T")[0];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });

    res.json({ grouped });
  } catch (err) {
    next(err);
  }
};

// CREATE session
export const createSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, contentId, contentType, startDate, durationMinutes, tags, notes } = req.body;

    if (!title || !startDate) {
      return res.status(400).json({ error: "title and startDate are required" });
    }

    const s = await StudySession.create({
      userId,
      title,
      contentId: contentId || null,
      contentType: contentType || null,
      startDate: new Date(startDate),
      durationMinutes: durationMinutes || 30,
      tags: tags || [],
      notes: notes || "",
    });

    // Log analytics for study session creation
    try {
      const AnalyticsService = (await import("../services/analyticsService.js")).default;
      await AnalyticsService.logActivity({ userId, activityType: "study_session_create", activityCount: 1, duration: s.durationMinutes * 60, subject: tags && tags[0] ? tags[0] : null });
    } catch (e) {
      console.error("Failed to log analytics for study session create", e);
    }

    res.status(201).json({ message: "Session created", session: s });
  } catch (err) {
    next(err);
  }
};

// UPDATE session
export const updateSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const payload = req.body;

    const s = await StudySession.findOneAndUpdate({ _id: id, userId }, payload, { new: true });
    if (!s) return res.status(404).json({ error: "Session not found" });
    res.json({ message: "Session updated", session: s });
  } catch (err) {
    next(err);
  }
};

// DELETE session (soft)
export const deleteSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const s = await StudySession.findOneAndUpdate({ _id: id, userId }, { isCancelled: true }, { new: true });
    if (!s) return res.status(404).json({ error: "Session not found" });
    res.json({ message: "Session cancelled" });
  } catch (err) {
    next(err);
  }
};
