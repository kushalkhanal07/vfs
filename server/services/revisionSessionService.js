import RevisionSession from "../models/revisionSessionModel.js";

export const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const parseRevisionDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return startOfDay(value);
  }

  const stringValue = String(value).trim();
  if (!stringValue) return null;

  const parsed = stringValue.includes("T")
    ? new Date(stringValue)
    : new Date(`${stringValue}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return startOfDay(parsed);
};

export const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags.map((tag) => String(tag).trim()).filter(Boolean);
};

export const normalizeRevisionSessionPayload = (payload = {}) => {
  const revisionDate = parseRevisionDate(payload.revisionDate);

  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    subject: String(payload.subject || "").trim(),
    revisionDate,
    revisionTime: String(payload.revisionTime || "").trim(),
    duration: Number(payload.duration),
    priority: payload.priority || "Medium",
    difficulty: String(payload.difficulty || "Medium").trim(),
    tags: normalizeTags(payload.tags),
    reminderEnabled: Boolean(payload.reminderEnabled),
    reminderInterval: payload.reminderInterval != null ? Number(payload.reminderInterval) : null,
    examBoost: Boolean(payload.examBoost),
    examDate: parseRevisionDate(payload.examDate),
  };
};

export const isValidRevisionTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const buildScheduledAt = (session) => {
  if (!session?.revisionDate || !session?.revisionTime) return null;

  const date = new Date(session.revisionDate);
  const [hours, minutes] = session.revisionTime.split(":").map(Number);
  if (Number.isNaN(date.getTime()) || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const getRevisionSessionsForUser = async (userId, options = {}) => {
  const { status, from, to } = options;
  const filter = { user: userId };

  if (status) {
    filter.status = status;
  } else {
    filter.status = { $ne: "cancelled" };
  }

  if (from || to) {
    filter.revisionDate = {};
    if (from) filter.revisionDate.$gte = from;
    if (to) filter.revisionDate.$lte = to;
  }

  return RevisionSession.find(filter).sort({ revisionDate: 1, revisionTime: 1 }).lean();
};
