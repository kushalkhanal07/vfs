import Session from "../models/session.model.js";
import { clearSessionJobs, scheduleSessionJobs, startSessionNow } from "./reminder.queue.js";

function normalizeParticipants(participants, createdBy) {
  const ids = new Set(
    [createdBy, ...(Array.isArray(participants) ? participants : [])].map((participant) => String(participant)).filter(Boolean)
  );
  return [...ids];
}

function normalizePayload(payload = {}, createdBy) {
  const startTime = new Date(payload.startTime);

  return {
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    startTime,
    participants: normalizeParticipants(payload.participants, createdBy),
    reminderInterval: Math.max(1, Number(payload.reminderInterval || 10)),
  };
}

function validatePayload(payload) {
  const errors = [];
  if (!payload.title) errors.push("title is required");
  if (!payload.startTime || Number.isNaN(payload.startTime.getTime())) errors.push("startTime is required");
  if (payload.startTime && payload.startTime.getTime() <= Date.now()) errors.push("startTime must be in the future");
  if (!Array.isArray(payload.participants) || payload.participants.length === 0) errors.push("participants are required");
  if (!Number.isFinite(payload.reminderInterval) || payload.reminderInterval < 1) {
    errors.push("reminderInterval must be at least 1 minute");
  }
  return errors;
}

export async function createSession(userId, payload) {
  const normalized = normalizePayload(payload, userId);
  const errors = validatePayload(normalized);
  if (errors.length > 0) {
    const error = new Error(errors[0]);
    error.details = errors;
    error.status = 400;
    throw error;
  }

  const session = await Session.create({
    ...normalized,
    createdBy: userId,
    status: "scheduled",
  });

  await scheduleSessionJobs(session);
  return session;
}

export async function listSessions(userId) {
  return Session.find({
    $or: [{ createdBy: userId }, { participants: userId }],
  })
    .sort({ startTime: 1 })
    .lean();
}

export async function getSessionById(userId, id) {
  return Session.findOne({
    _id: id,
    $or: [{ createdBy: userId }, { participants: userId }],
  }).lean();
}

export async function updateSession(userId, id, payload) {
  const session = await Session.findOne({ _id: id, createdBy: userId });
  if (!session) {
    const error = new Error("Session not found");
    error.status = 404;
    throw error;
  }

  if (["started", "completed", "cancelled"].includes(session.status)) {
    const error = new Error("Cannot update a session that has already started or finished");
    error.status = 400;
    throw error;
  }

  const previousStartTime = session.startTime?.getTime();
  const previousInterval = session.reminderInterval;
  const previousParticipants = JSON.stringify(session.participants.map(String).sort());

  if (payload.title !== undefined) session.title = String(payload.title || "").trim();
  if (payload.description !== undefined) session.description = String(payload.description || "").trim();
  if (payload.startTime !== undefined) session.startTime = new Date(payload.startTime);
  if (payload.participants !== undefined) {
    session.participants = normalizeParticipants(payload.participants, userId);
  }
  if (payload.reminderInterval !== undefined) {
    session.reminderInterval = Math.max(1, Number(payload.reminderInterval || 10));
  }

  const updatedErrors = validatePayload({
    title: session.title,
    startTime: session.startTime,
    participants: session.participants,
    reminderInterval: session.reminderInterval,
  });

  if (updatedErrors.length > 0) {
    const error = new Error(updatedErrors[0]);
    error.details = updatedErrors;
    error.status = 400;
    throw error;
  }

  const nextStartTime = session.startTime?.getTime();
  const nextInterval = session.reminderInterval;
  const nextParticipants = JSON.stringify(session.participants.map(String).sort());
  const scheduleChanged =
    previousStartTime !== nextStartTime || previousInterval !== nextInterval || previousParticipants !== nextParticipants;

  if (scheduleChanged) {
    session.sentReminderMinutes = [];
  }

  await session.save();
  clearSessionJobs(String(session._id));
  await scheduleSessionJobs(session);
  return session;
}

export async function cancelSession(userId, id) {
  const session = await Session.findOneAndUpdate(
    { _id: id, createdBy: userId, status: { $ne: "cancelled" } },
    {
      $set: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    },
    { new: true }
  );

  if (!session) {
    const error = new Error("Session not found");
    error.status = 404;
    throw error;
  }

  clearSessionJobs(String(session._id));
  return session;
}

export async function startSession(userId, id) {
  const session = await Session.findOne({ _id: id, $or: [{ createdBy: userId }, { participants: userId }] });
  if (!session) {
    const error = new Error("Session not found");
    error.status = 404;
    throw error;
  }

  const startedSession = await startSessionNow(session._id);
  if (!startedSession) {
    const error = new Error("Session has already started or is not scheduled");
    error.status = 400;
    throw error;
  }

  clearSessionJobs(String(session._id), "start");
  return startedSession;
}

export async function completeSession(userId, id) {
  const session = await Session.findOneAndUpdate(
    { _id: id, $or: [{ createdBy: userId }, { participants: userId }] },
    {
      $set: {
        status: "completed",
        completedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!session) {
    const error = new Error("Session not found");
    error.status = 404;
    throw error;
  }

  clearSessionJobs(String(session._id));
  return session;
}