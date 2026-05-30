import RevisionSession from "../models/revisionSessionModel.js";
import { createNotification } from "../controllers/notificationController.js";
import { buildScheduledAt } from "./revisionSessionService.js";

const MAX_TIMEOUT_MS = 2_147_483_647;
const activeTimers = new Map();
let reconcilerHandle = null;

function keyFor(sessionId) {
  return `revision:${sessionId}`;
}

function clearManagedTimer(key) {
  const t = activeTimers.get(key);
  if (t) {
    clearTimeout(t);
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
      // target time still in future due to MAX_TIMEOUT_MS clipping
      scheduleManagedTimer(key, targetTime, handler);
      return;
    }

    await handler();
  }, waitMs);

  activeTimers.set(key, timer);
}

export async function sendRevisionReminder(sessionId) {
  const session = await RevisionSession.findOneAndUpdate(
    { _id: sessionId, status: "scheduled", sentReminder: { $ne: true } },
    { $set: { sentReminder: true } },
    { new: true }
  ).lean();

  if (!session) return;

  try {
    await createNotification(
      session.user,
      "Revision reminder",
      `Your revision session "${session.title}" starts at ${session.revisionTime}.`,
      "revision_reminder",
      { sessionId: String(session._id) }
    );
  } catch (e) {
    console.error("Failed to create revision reminder notification:", e);
  }
}

export async function scheduleRevisionReminder(sessionInput) {
  const session = sessionInput?.toObject ? sessionInput.toObject() : sessionInput;
  if (!session) return;

  const key = keyFor(session._id);
  clearManagedTimer(key);

  if (!session.reminderEnabled) return;
  const interval = Number(session.reminderInterval || 0);
  if (!Number.isFinite(interval) || interval <= 0) return;

  const scheduledAt = buildScheduledAt(session);
  if (!scheduledAt) return;

  const reminderTime = new Date(scheduledAt.getTime() - interval * 60000);
  if (reminderTime.getTime() <= Date.now()) return;

  scheduleManagedTimer(key, reminderTime, async () => {
    await sendRevisionReminder(session._id);
  });
}

export function clearRevisionReminder(sessionId) {
  const key = keyFor(sessionId);
  clearManagedTimer(key);
}

export async function reconcileRevisionReminders() {
  const sessions = await RevisionSession.find({ status: "scheduled", reminderEnabled: true, sentReminder: { $ne: true } }).lean();
  for (const session of sessions) {
    const key = keyFor(session._id);
    if (!activeTimers.has(key)) {
      await scheduleRevisionReminder(session);
    }
  }
}

export async function bootstrapRevisionReminderQueue() {
  await reconcileRevisionReminders();

  if (reconcilerHandle) clearInterval(reconcilerHandle);
  reconcilerHandle = setInterval(() => {
    reconcileRevisionReminders().catch((err) => console.error("Failed to reconcile revision reminders:", err));
  }, 5 * 60 * 1000);
}

export async function stopRevisionReminderQueue() {
  if (reconcilerHandle) {
    clearInterval(reconcilerHandle);
    reconcilerHandle = null;
  }

  for (const k of [...activeTimers.keys()]) clearManagedTimer(k);
}
