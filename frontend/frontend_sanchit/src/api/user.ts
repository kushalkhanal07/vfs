const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  picture: string;
  role: string;
  status: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role: string;
  status: string;
}

export interface DashboardProfile {
  user: UserProfile & { loginProvider: string; subscriptionActive: boolean };
  stats: {
    totalNotes: number;
    totalFiles: number;
    upcomingRevisions: number;
    revisionStreak: number;
  };
}

// GET CURRENT USER (/user)
export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/user`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch current user");
  }
  return res.json() as Promise<CurrentUser>;
}

// GET USER PROFILE
export async function getUserProfile() {
  const res = await fetch(`${API_BASE}/user/me`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch user profile");
  }
  return res.json();
}

// GET DASHBOARD PROFILE
export async function getDashboardProfile() {
  const res = await fetch(`${API_BASE}/user/dashboard-profile`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch dashboard profile");
  }
  return res.json() as Promise<DashboardProfile>;
}

// LOGOUT CURRENT SESSION
export async function logoutUser() {
  const res = await fetch(`${API_BASE}/user/logout`, {
    method: "POST",
    credentials: "include",
  });

  // Server returns 204 on success. Keep this tolerant to avoid blocking local cleanup.
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to logout");
  }
}

// UPDATE USER PROFILE
export async function updateUserProfile(payload: { name?: string; email?: string }) {
  const res = await fetch(`${API_BASE}/user/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to update profile");
  }
  return res.json();
}
