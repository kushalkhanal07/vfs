const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE}/api/admin${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Admin request failed");
  }

  return data;
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminDashboardResponse {
  summary: Record<string, number>;
  charts: Record<string, Array<Record<string, unknown>>>;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  filesCount: number;
  notesCount: number;
  revisionCount: number;
  isLoggedIn: boolean;
  storageUsed: number;
  storageLimit: number;
  joinedDate: string;
  picture?: string;
}

export interface AdminUserListResponse {
  users: AdminUserRow[];
  pagination: AdminPagination;
}

export interface AdminUserDetailResponse {
  user: AdminUserRow & {
    storagePercent: number;
    joinedAt: string;
    updatedAt?: string;
  };
  analytics: {
    noteCount: number;
    fileCount: number;
    revisionCount: number;
    recentActivity: Array<Record<string, unknown>>;
    recentSearches: Array<Record<string, unknown>>;
    subjectMastery: Array<Record<string, unknown>>;
  };
}

export interface AdminListResponse<T> {
  [key: string]: T[] | AdminPagination | Record<string, number> | unknown;
}

export async function getAdminDashboard() {
  return requestJson("/dashboard") as Promise<AdminDashboardResponse>;
}

export async function getAdminUsers(params: {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return requestJson(`/users?${searchParams.toString()}`) as Promise<AdminUserListResponse>;
}

export async function getAdminUser(id: string) {
  return requestJson(`/users/${id}`) as Promise<AdminUserDetailResponse>;
}

export async function updateAdminUserStatus(id: string, status: string) {
  return requestJson(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateAdminUserRole(id: string, role: string) {
  return requestJson(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function deleteAdminUser(id: string) {
  return requestJson(`/users/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminLearningAnalytics() {
  return requestJson("/analytics/mastery");
}

export async function getAdminRevisionAnalytics() {
  return requestJson("/analytics/revisions");
}

export async function getAdminProductivityAnalytics() {
  return requestJson("/analytics/productivity");
}

export async function getAdminFiles(params: { search?: string; type?: string; page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return requestJson(`/files?${searchParams.toString()}`);
}

export async function deleteAdminFile(id: string) {
  return requestJson(`/files/${id}`, { method: "DELETE" });
}

export async function getAdminStorage() {
  return requestJson("/storage");
}

export async function getAdminSearchAnalytics() {
  return requestJson("/search-analytics");
}

export async function getAdminSpam(params: { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  return requestJson(`/spam?${searchParams.toString()}`);
}

export async function getAdminSpamIncident(id: string) {
  return requestJson(`/spam/${id}`);
}

export async function reviewAdminSpamIncident(id: string, payload: Record<string, unknown>) {
  return requestJson(`/spam/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getAdminSubjects() {
  return requestJson("/subjects");
}

export async function createAdminSubject(payload: Record<string, unknown>) {
  return requestJson("/subjects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminSubject(id: string, payload: Record<string, unknown>) {
  return requestJson(`/subjects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminSubject(id: string) {
  return requestJson(`/subjects/${id}`, { method: "DELETE" });
}

export async function getAdminNotifications() {
  return requestJson("/notifications");
}

export async function createAdminNotification(payload: Record<string, unknown>) {
  return requestJson("/notifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminFeedback() {
  return requestJson("/feedback");
}

export async function updateAdminFeedback(id: string, payload: Record<string, unknown>) {
  return requestJson(`/feedback/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getAdminLogs() {
  return requestJson("/logs");
}

export async function getAdminSettings() {
  return requestJson("/settings");
}

export async function updateAdminSettings(payload: Record<string, unknown>) {
  return requestJson("/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
