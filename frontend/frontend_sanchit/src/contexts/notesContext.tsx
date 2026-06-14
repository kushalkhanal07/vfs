import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as api from "@/api/notes";

const NotesContext = createContext(null);

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getNotes();
      setNotes(res.notes || res || []);
    } catch (e) {
      setError(e.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(async (payload) => {
    const res = await api.createNote(payload);
    const created = res?.note || res;
    setNotes((s) => [created, ...s]);
    // notify analytics components to refresh
    try {
      window.dispatchEvent(new CustomEvent("analytics:refresh"));
    } catch (e) {}
    return created;
  }, []);

  const update = useCallback(async (id, payload) => {
    const res = await api.updateNote(id, payload);
    const updated = res?.note || res;
    setNotes((s) => s.map((x) => (x._id === id ? updated : x)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await api.deleteNote(id);
    setNotes((s) => s.filter((x) => x._id !== id));
  }, []);

  return (
    <NotesContext.Provider value={{ notes, loading, error, load, create, update, remove }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}
