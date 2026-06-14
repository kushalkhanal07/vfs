import React, { createContext, useContext, useState, useCallback } from "react";
import * as api from "@/api/search";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.searchQuery(q);
      const raw = res.results || res || [];

      // Helpers to safely highlight and build a short snippet
      const escapeHtml = (s = "") =>
        String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");

      const escapeRegex = (v = "") => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const highlight = (text = "", query = "") => {
        const tokens = query
          .split(/\s+/)
          .map((t) => t.trim())
          .filter(Boolean)
          .map(escapeRegex);
        if (tokens.length === 0) return escapeHtml(text);
        const re = new RegExp(`(${tokens.join("|")})`, "gi");
        return escapeHtml(text).replace(re, "<mark class='bg-primary/20 text-foreground rounded px-0.5'>$1</mark>");
      };

      const buildSnippet = (text = "", q = "") => {
        if (!text) return "";
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        const start = idx > 0 ? Math.max(0, idx - 40) : 0;
        const end = Math.min(text.length, (idx >= 0 ? idx + 80 : 120));
        let snippet = text.substring(start, end);
        if (start > 0) snippet = `...${snippet}`;
        if (end < text.length) snippet = `${snippet}...`;
        return highlight(snippet, q);
      };

      const normalized = raw.map((r) => {
        const id = r._id || r.id;
        const type = (r.type || (r.content ? "note" : r.name ? "file" : "folder") || "note").toLowerCase();
        const title = r.title || r.name || "Untitled";
        const text = r.content || r.name || r.title || "";
        const score = Math.round((r.relevanceScore || r.score || 0) * 100) || 0;

        return {
          id,
          type,
          title,
          snippet: buildSnippet(text, q),
          score,
          subject: r.subject || "",
          raw: r,
        };
      });

      setResults(normalized);
      setLoading(false);
      return res;
    } catch (e) {
      setError(e.message || "Search failed");
      setLoading(false);
      return null;
    }
  }, []);

  return (
    <SearchContext.Provider value={{ query, setQuery, results, loading, error, search }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
