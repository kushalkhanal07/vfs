const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function getSettings() {
  const res = await fetch(`${API_BASE}/api/settings`, { credentials: "include" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch settings");
  }
  return res.json();
}

export async function updateSettings(payload) {
  const res = await fetch(`${API_BASE}/api/settings`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to update settings");
  }
  return res.json();
}
