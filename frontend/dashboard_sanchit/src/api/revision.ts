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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to add to revision");
  }
  return res.json();
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to submit review");
  }
  return res.json();
}

// GET TODAY'S REVISIONS
export async function getTodayRevisions() {
  const res = await fetch(`${API_BASE}/api/revision/today`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch today's revisions");
  }
  return res.json();
}

// GET UPCOMING REVISIONS
export async function getUpcomingRevisions(days: number = 30) {
  const res = await fetch(`${API_BASE}/api/revision/upcoming?days=${days}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch upcoming revisions");
  }
  return res.json();
}

// GET REVISION HISTORY
export async function getRevisionHistory(limit: number = 50) {
  const res = await fetch(`${API_BASE}/api/revision/history?limit=${limit}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch revision history");
  }
  return res.json();
}

// GET REVISION STATS
export async function getRevisionStats() {
  const res = await fetch(`${API_BASE}/api/revision/stats`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch revision stats");
  }
  return res.json();
}

// REMOVE FROM REVISION
export async function removeFromRevision(scheduleId: string) {
  const res = await fetch(`${API_BASE}/api/revision/${scheduleId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to remove from revision");
  }
  return res.json();
}
