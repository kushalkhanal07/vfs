const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  folderId: string | null;
  isPinned: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  wordCount: number;
  lastEditedAt: string;
  createdAt: string;
  updatedAt: string;
}

// CREATE NOTE
export async function createNote(payload: {
  title: string;
  content?: string;
  folderId?: string | null;
  tags?: string[];
  overrideDuplicate?: boolean;
}) {
  const res = await fetch(`${API_BASE}/api/notes`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err?.message || err?.error || "Failed to create note");
    (error as Error & { code?: string; response?: { data?: unknown } }).code = err?.error;
    (error as Error & { code?: string; response?: { data?: unknown } }).response = { data: err };
    throw error;
  }
  return res.json();
}

// CHECK NOTE CSPA (duplicate / related) BEFORE CREATING
export async function checkNoteCspa(payload: {
  title: string;
  content?: string;
  tags?: string[];
}) {
  const res = await fetch(`${API_BASE}/api/notes/check-cspa`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to check note similarity");
  }

  return res.json();
}

// CHECK NOTE SHIELD BEFORE CREATING
export async function checkNoteShield(payload: {
  title: string;
  content?: string;
}) {
  const res = await fetch(`${API_BASE}/api/notes/check-shield`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to scan note content");
  }

  return res.json();
}

// MERGE A DRAFT NOTE INTO AN EXISTING NOTE
export async function mergeNote(payload: {
  targetNoteId: string;
  sourceNoteId?: string;
  title: string;
  content?: string;
  tags?: string[];
  folderId?: string | null;
}) {
  const res = await fetch(`${API_BASE}/api/notes/merge`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err?.message || err?.error || "Failed to merge notes");
    (error as Error & { code?: string; response?: { data?: unknown } }).code = err?.error;
    (error as Error & { code?: string; response?: { data?: unknown } }).response = { data: err };
    throw error;
  }

  return res.json();
}

// GET ALL NOTES
export async function getNotes(filters?: {
  archived?: boolean;
  favorite?: boolean;
  pinned?: boolean;
  folder?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.archived !== undefined) params.append("archived", String(filters.archived));
  if (filters?.favorite !== undefined) params.append("favorite", String(filters.favorite));
  if (filters?.pinned !== undefined) params.append("pinned", String(filters.pinned));
  if (filters?.folder) params.append("folder", filters.folder);

  const res = await fetch(`${API_BASE}/api/notes?${params}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch notes");
  }
  return res.json();
}

// GET SINGLE NOTE
export async function getNote(id: string) {
  const res = await fetch(`${API_BASE}/api/notes/${id}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch note");
  }
  return res.json();
}

// UPDATE NOTE
export async function updateNote(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/api/notes/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to update note");
  }
  return res.json();
}

// DELETE NOTE
export async function deleteNote(id: string) {
  const res = await fetch(`${API_BASE}/api/notes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to delete note");
  }
  return res.json();
}

// PIN NOTE
export async function togglePin(id: string) {
  const res = await fetch(`${API_BASE}/api/notes/${id}/pin`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to toggle pin");
  }
  return res.json();
}

// ARCHIVE NOTE
export async function toggleArchive(id: string) {
  const res = await fetch(`${API_BASE}/api/notes/${id}/archive`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to toggle archive");
  }
  return res.json();
}

// FAVORITE NOTE
export async function toggleFavorite(id: string) {
  const res = await fetch(`${API_BASE}/api/notes/${id}/favorite`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to toggle favorite");
  }
  return res.json();
}

// GET RECENT NOTES
export async function getRecentNotes(limit: number = 10) {
  const res = await fetch(`${API_BASE}/api/notes/recent?limit=${limit}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch recent notes");
  }
  return res.json();
}

// GET NOTES BY DATE
export async function getNotesByDate(date: string) {
  const res = await fetch(`${API_BASE}/api/notes/date/${date}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch notes by date");
  }
  return res.json();
}
