const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  picture: string;
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
