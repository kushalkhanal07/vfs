const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function getSubjectMastery() {
  const res = await fetch(`${API_BASE}/api/analytics/subject-mastery`, { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch subject mastery");
  }
  return res.json();
}

export async function getActivityHeatmap(days = 84) {
  const res = await fetch(`${API_BASE}/api/analytics/activity-heatmap?days=${days}`, { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch activity heatmap");
  }
  return res.json();
}
