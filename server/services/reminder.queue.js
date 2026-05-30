import Session from "../models/session.model.js";
import { createNotification } from "../controllers/notificationController.js";
import { emitSessionReminder, emitSessionStarting } from "./socket.gateway.js";

const MAX_TIMEOUT_MS = 2_147_483_647;
const activeTimers = new Map();
let reconcilerHandle = null;

function sessionKey(sessionId, suffix) {
  return `${sessionId}:${suffix}`;
}

function clearManagedTimer(key) {
  const timer = activeTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(key);
  }
}

function scheduleManagedTimer(key, targetTime, handler) {
  clearManagedTimer(key);

  const delay = Math.max(0, targetTime.getTime() - Date.now());
  const waitMs = Math.min(delay, MAX_TIMEOUT_MS);

  const timer = setTimeout(async () => {
    activeTimers.delete(key);

    if (Date.now() < targetTime.getTime()) {
      scheduleManagedTimer(key, targetTime, handler);
      return;
    }

    await handler();
  }, waitMs);

  activeTimers.set(key, timer);
}

export function buildReminderMinutes(session, now = new Date()) {
  const startTime = new Date(session.startTime);
  if (Number.isNaN(startTime.getTime())) return [];

  const remainingMinutes = Math.floor((startTime.getTime() - now.getTime()) / 60000);
  if (remainingMinutes < 1) return [];

  const reminderInterval = Math.max(1, Number(session.reminderInterval || 10));
  const minutes = new Set();

  for (let minute = Math.floor(remainingMinutes / reminderInterval) * reminderInterval; minute >= 1; minute -= reminderInterval) {
    if (minute <= remainingMinutes) {
      minutes.add(minute);
    }
  }

  if (remainingMinutes >= 5) minutes.add(5);
  minutes.add(1);

  return [...minutes]
    .filter((minute) => minute > 0 && minute <= remainingMinutes)
    .sort((left, right) => right - left);
}

async function sendReminder(sessionId, minutesLeft) {
  const session = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      status: "scheduled",
      sentReminderMinutes: { $ne: minutesLeft },
    },
    {
      $addToSet: { sentReminderMinutes: minutesLeft },
    },
    { new: true }
  ).lean(false);

  if (!session) return;

  await Promise.all(
    (session.participants || []).map(async (participantId) => {
      await createNotification(
        participantId,
        "Session reminder",
        `Session starts in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}`,
        "session_reminder",
        { sessionId: String(session._id), minutesLeft }
      );
    })
  );

  emitSessionReminder(session, minutesLeft);
}

export async function startSessionNow(sessionId) {
  const session = await Session.findOneAndUpdate(
    {
      _id: sessionId,
      status: "scheduled",
    },
    {
      $set: {
        status: "started",
        startedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!session) return null;

  clearSessionJobs(String(session._id));
  emitSessionStarting(session);
  return session;
}

export async function scheduleSessionJobs(sessionInput) {
  const session = sessionInput?.toObject ? sessionInput.toObject() : sessionInput;
  if (!session || session.status !== "scheduled" || !session.startTime) return;

  clearSessionJobs(String(session._id));

  const startTime = new Date(session.startTime);
  if (Number.isNaN(startTime.getTime()) || startTime.getTime() <= Date.now()) {
    return;
  }

  const reminderMinutes = buildReminderMinutes(session);
  const alreadySent = new Set((session.sentReminderMinutes || []).map((value) => Number(value)));

  for (const minutesLeft of reminderMinutes) {
    if (alreadySent.has(minutesLeft)) continue;

    const reminderTime = new Date(startTime.getTime() - minutesLeft * 60000);
    const key = sessionKey(session._id, `reminder:${minutesLeft}`);
    scheduleManagedTimer(key, reminderTime, async () => {
      await sendReminder(session._id, minutesLeft);
    });
  }

  const startKey = sessionKey(session._id, "start");
  scheduleManagedTimer(startKey, startTime, async () => {
    await startSessionNow(session._id);
    clearSessionJobs(String(session._id), "start");
  });
}

export function clearSessionJobs(sessionId, suffix = null) {
  if (suffix) {
    clearManagedTimer(sessionKey(sessionId, suffix));
    return;
  }

  for (const key of [...activeTimers.keys()]) {
    if (key.startsWith(`${sessionId}:`)) {
      clearManagedTimer(key);
    }
  }
}

export async function reconcileScheduledSessions() {
  const sessions = await Session.find({
    status: "scheduled",
    startTime: { $gt: new Date() },
  }).lean();

  for (const session of sessions) {
    const hasStartTimer = activeTimers.has(sessionKey(session._id, "start"));
    if (!hasStartTimer) {
      await scheduleSessionJobs(session);
    }
  }
}

export async function bootstrapReminderQueue() {
  await reconcileScheduledSessions();

  if (reconcilerHandle) {
    clearInterval(reconcilerHandle);
  }

  reconcilerHandle = setInterval(() => {
    reconcileScheduledSessions().catch((error) => {
      console.error("Failed to reconcile reminder jobs:", error);
    });
  }, 5 * 60 * 1000);
}

export async function stopReminderQueue() {
  if (reconcilerHandle) {
    clearInterval(reconcilerHandle);
    reconcilerHandle = null;
  }

  for (const key of [...activeTimers.keys()]) {
    clearManagedTimer(key);
  }
}