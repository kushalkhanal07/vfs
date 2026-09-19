const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export interface RevisionSchedule {
  _id: string;
  contentId: string;
  contentType: "note" | "file" | "folder";
  nextReviewDate: string;
  priority: "High" | "Medium" | "Low";
  easeFactor: number;
  repetitionCount: number;
  interval: number;
  isActive: boolean;
  dueToday: boolean;
}

export type RevisionPriority = RevisionSession["priority"];

export type RevisionSessionStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

export interface RevisionSession {
  _id: string;
  title: string;
  description: string;
  subject: string;
  revisionDate: string;
  revisionTime: string;
  duration: number;
  priority: "High" | "Medium" | "Low";
  difficulty: string;
  tags: string[];
  reminderEnabled: boolean;
  reminderInterval?: number | null;
  examBoost: boolean;
  examDate?: string | null;
  status: RevisionSessionStatus;
  scheduledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RevisionSessionPayload {
  title: string;
  description: string;
  subject: string;
  revisionDate: string;
  revisionTime: string;
  duration: number;
  priority: "High" | "Medium" | "Low";
  difficulty: string;
  tags: string[];
  reminderEnabled: boolean;
  reminderInterval?: number | null;
  examBoost: boolean;
  examDate?: string | null;
}

export interface SubjectPriority {
  subject: string;
  score: number; // 0-100
  level: "High" | "Medium" | "Low";
  factors: {
    daysSinceLastRevision: number | null;
    recallScore: number | null; // 0-5
    examDaysLeft: number | null;
    difficulty: number; // 0-5
  };
}

type RevisionSessionTiming = Pick<RevisionSession, "status" | "revisionDate" | "revisionTime" | "duration" | "scheduledAt">;

function parseScheduledAt(session: RevisionSessionTiming) {
  if (session.scheduledAt) {
    const scheduledAt = new Date(session.scheduledAt);
    if (!Number.isNaN(scheduledAt.getTime())) {
      return scheduledAt;
    }
  }

  if (!session.revisionDate || !session.revisionTime) {
    return null;
  }

  const scheduledAt = new Date(`${session.revisionDate}T${session.revisionTime}`);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
}

export function getRevisionSessionStatus(session: RevisionSessionTiming, now = new Date()): RevisionSessionStatus {
  if (session.status === "completed" || session.status === "cancelled") {
    return session.status;
  }

  const scheduledAt = parseScheduledAt(session);
  if (!scheduledAt) {
    return session.status;
  }

  const durationMinutes = Number(session.duration || 0);
  const endsAt = new Date(scheduledAt);
  if (Number.isFinite(durationMinutes) && durationMinutes > 0) {
    endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);
  }

  if (now >= endsAt) {
    return "completed";
  }

  if (now >= scheduledAt) {
    return "in-progress";
  }

  return "scheduled";
}

export function enrichRevisionSession(session: RevisionSession, now = new Date()): RevisionSession {
  return {
    ...session,
    status: getRevisionSessionStatus(session, now),
  };
}

export interface RevisionSessionListResponse {
  sessions: RevisionSession[];
  todaySessions: RevisionSession[];
  upcomingSessions: RevisionSession[];
  count: number;
}

async function parseJsonResponse<T>(res: Response, fallbackMessage: string) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || fallbackMessage);
  }
  return res.json() as Promise<T>;
}

// ADD TO REVISION
export async function addToRevision(payload: {
  contentId: string;
  contentType: "note" | "file" | "folder";
  priority?: "High" | "Medium" | "Low";
}) {
  const res = await fetch(`${API_BASE}/api/revision/add`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res, "Failed to add to revision");
}

// SUBMIT REVIEW
export async function submitReview(payload: {
  scheduleId: string;
  reviewScore: number;
  timeSpent?: number;
  notes?: string;
}) {
  const res = await fetch(`${API_BASE}/api/revision/review`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(res, "Failed to submit review");
}

// GET TODAY'S REVISIONS
export async function getTodayRevisions() {
  const res = await fetch(`${API_BASE}/api/revision/today`, {
    credentials: "include",
  });
  return parseJsonResponse(res, "Failed to fetch today's revisions");
}

// GET UPCOMING REVISIONS
export async function getUpcomingRevisions(days: number = 30) {
  const res = await fetch(`${API_BASE}/api/revision/upcoming?days=${days}`, {
    credentials: "include",
  });
  return parseJsonResponse(res, "Failed to fetch upcoming revisions");
}

// GET REVISION HISTORY
export async function getRevisionHistory(limit: number = 50) {
  const res = await fetch(`${API_BASE}/api/revision/history?limit=${limit}`, {
    credentials: "include",
  });
  return parseJsonResponse(res, "Failed to fetch revision history");
}

// GET REVISION STATS
export async function getRevisionStats() {
  const res = await fetch(`${API_BASE}/api/revision/stats`, {
    credentials: "include",
  });
  return parseJsonResponse(res, "Failed to fetch revision stats");
}

// GET SUBJECT PRIORITY RANKING (highest score = revise first)
export async function getRevisionPriorities() {
  const res = await fetch(`${API_BASE}/api/revision/priority`, {
    credentials: "include",
  });
  return parseJsonResponse<{ subjects: SubjectPriority[]; count: number }>(
    res,
    "Failed to fetch revision priorities"
  );
}

// REMOVE FROM REVISION
export async function removeFromRevision(scheduleId: string) {
  const res = await fetch(`${API_BASE}/api/revision/${scheduleId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parseJsonResponse(res, "Failed to remove from revision");
}

export async function getRevisionSessions(params?: { status?: string; from?: string; to?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);

  const query = searchParams.toString();
  const res = await fetch(`${API_BASE}/api/revision/session${query ? `?${query}` : ""}`, {
    credentials: "include",
  });
  return parseJsonResponse<RevisionSessionListResponse>(res, "Failed to fetch revision sessions");
}

export async function getRevisionSessionList(params?: { status?: string; from?: string; to?: string }) {
  return getRevisionSessions(params);
}

export async function getRevisionSessionById(id: string) {
  const res = await fetch(`${API_BASE}/api/revision/session/${id}`, {
    credentials: "include",
  });
  return parseJsonResponse<{ session: RevisionSession }>(res, "Failed to fetch revision session");
}

export async function createRevisionSession(payload: RevisionSessionPayload) {
  const res = await fetch(`${API_BASE}/api/revision/session`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<{ message: string; session: RevisionSession; notification?: any }>(
    res,
    "Failed to create revision session"
  );
}

export async function updateRevisionSession(id: string, payload: Partial<RevisionSessionPayload>) {
  const res = await fetch(`${API_BASE}/api/revision/session/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<{ message: string; session: RevisionSession; notification?: any }>(
    res,
    "Failed to update revision session"
  );
}

export async function deleteRevisionSession(id: string) {
  const res = await fetch(`${API_BASE}/api/revision/session/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return parseJsonResponse<{ message: string; session: RevisionSession }>(
    res,
    "Failed to delete revision session"
  );
}

// Backward-compatible aliases used by existing context
export async function getRevisions(_itemId?: string) {
  return getTodayRevisions();
}

export async function createRevision(payload: {
  contentId: string;
  contentType: "note" | "file" | "folder";
  priority?: "High" | "Medium" | "Low";
}) {
  return addToRevision(payload);
}

export async function getWeekSessions(start?: string) {
  if (!start) {
    return getRevisionSessions();
  }

  const from = new Date(start);
  const to = new Date(from);
  to.setDate(to.getDate() + 6);

  return getRevisionSessions({ from: from.toISOString(), to: to.toISOString() });
}

export async function createSession(payload: RevisionSessionPayload) {
  return createRevisionSession(payload);
}
