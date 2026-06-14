const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | "revision_reminder"
    | "missed_revision"
    | "study_streak"
    | "deadline_reminder"
    | "upload_success"
    | "learning_recommendation"
    | "system";
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

// GET ALL NOTIFICATIONS
export async function getNotifications(limit: number = 50, skip: number = 0) {
  const res = await fetch(
    `${API_BASE}/api/notifications?limit=${limit}&skip=${skip}`,
    {
      credentials: "include",
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch notifications");
  }
  return res.json();
}

// GET UNREAD COUNT
export async function getUnreadCount() {
  const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch unread count");
  }
  return res.json();
}

// MARK AS READ
export async function markAsRead(id: string) {
  const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
    method: "PUT",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to mark as read");
  }
  return res.json();
}

// MARK ALL AS READ
export async function markAllAsRead() {
  const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
    method: "PUT",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to mark all as read");
  }
  return res.json();
}

// DELETE NOTIFICATION
export async function deleteNotification(id: string) {
  const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to delete notification");
  }
  return res.json();
}

// CLEANUP OLD NOTIFICATIONS
export async function cleanupOldNotifications() {
  const res = await fetch(`${API_BASE}/api/notifications/cleanup/old`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to cleanup notifications");
  }
  return res.json();
}
