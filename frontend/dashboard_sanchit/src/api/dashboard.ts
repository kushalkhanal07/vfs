const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

// GET DASHBOARD OVERVIEW
export async function getDashboardOverview() {
  const res = await fetch(`${API_BASE}/api/dashboard/overview`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch dashboard overview");
  }
  return res.json();
}

// GET RECENT NOTES
export async function getRecentNotes(limit: number = 5) {
  const res = await fetch(`${API_BASE}/api/dashboard/recent-notes?limit=${limit}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch recent notes");
  }
  return res.json();
}

// GET RECENT FILES
export async function getRecentFiles(limit: number = 5) {
  const res = await fetch(`${API_BASE}/api/dashboard/recent-files?limit=${limit}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch recent files");
  }
  return res.json();
}

// GET REVISION SUMMARY
export async function getRevisionSummary() {
  const res = await fetch(`${API_BASE}/api/dashboard/revision-summary`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch revision summary");
  }
  return res.json();
}

// GET ACTIVITY SUMMARY
export async function getActivitySummary() {
  const res = await fetch(`${API_BASE}/api/dashboard/activity`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch activity summary");
  }
  return res.json();
}

// GET STUDY STREAK
export async function getStudyStreak() {
  const res = await fetch(`${API_BASE}/api/dashboard/streak`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch study streak");
  }
  return res.json();
}

// GET LEARNING RECOMMENDATIONS
export async function getLearningRecommendations() {
  const res = await fetch(`${API_BASE}/api/dashboard/recommendations`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch recommendations");
  }
  return res.json();
}

// GET COMPLETE STATS
export async function getCompleteStats() {
  const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch stats");
  }
  return res.json();
}
