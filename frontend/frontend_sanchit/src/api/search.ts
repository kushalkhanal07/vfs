const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export interface SearchResult {
  _id: string;
  type: "note" | "file" | "folder";
  title?: string;
  name?: string;
  content?: string;
  relevanceScore: number;
}

// GLOBAL SEARCH
export async function globalSearch(query: string) {
  if (!query || query.trim().length === 0) {
    throw new Error("Search query is required");
  }

  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to search");
  }
  return res.json();
}

// SEARCH NOTES
export async function searchNotes(query: string) {
  if (!query || query.trim().length === 0) {
    throw new Error("Search query is required");
  }

  const res = await fetch(`${API_BASE}/api/search/notes?q=${encodeURIComponent(query)}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to search notes");
  }
  return res.json();
}

// SEARCH FILES
export async function searchFiles(query: string) {
  if (!query || query.trim().length === 0) {
    throw new Error("Search query is required");
  }

  const res = await fetch(`${API_BASE}/api/search/files?q=${encodeURIComponent(query)}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to search files");
  }
  return res.json();
}

// SEARCH FOLDERS
export async function searchFolders(query: string) {
  if (!query || query.trim().length === 0) {
    throw new Error("Search query is required");
  }

  const res = await fetch(`${API_BASE}/api/search/folders?q=${encodeURIComponent(query)}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to search folders");
  }
  return res.json();
}

// GET SEARCH SUGGESTIONS
export async function getSearchSuggestions(partial: string) {
  if (!partial || partial.trim().length < 2) {
    return { suggestions: [] };
  }

  const res = await fetch(
    `${API_BASE}/api/search/suggestions?q=${encodeURIComponent(partial)}`,
    {
      credentials: "include",
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch suggestions");
  }
  return res.json();
}

// GET RECENT SEARCHES
export async function getRecentSearches(limit: number = 10) {
  const res = await fetch(`${API_BASE}/api/search/recent?limit=${limit}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to fetch recent searches");
  }
  return res.json();
}

// CLEAR SEARCH HISTORY
export async function clearSearchHistory() {
  const res = await fetch(`${API_BASE}/api/search/history/clear`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to clear search history");
  }
  return res.json();
}

// Backward-compatible alias used by existing context
export async function searchQuery(q: string) {
  return globalSearch(q);
}
