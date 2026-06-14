import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import * as api from "@/api/revision";

const RevisionContext = createContext(null);

export function RevisionProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const load = useCallback(async (range) => {
    setLoading(true);
    setError(null);
    try {
      const res = range?.from && range?.to
        ? await api.getRevisionSessions({ from: range.from, to: range.to })
        : await api.getRevisionSessions();

      // API returns sessions, todaySessions, upcomingSessions
      setSessions(res.sessions || []);
      setTodaySessions(res.todaySessions || []);
      setUpcomingSessions(res.upcomingSessions || []);
      return res;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load revisions");
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload) => {
    const response = await api.createRevisionSession(payload);
    const nextSession = response?.session;
    if (nextSession) {
      setSessions((current) => [nextSession, ...current.filter((item) => item._id !== nextSession._id)]);
    }
    await load();
    try { window.dispatchEvent(new CustomEvent("analytics:refresh")); } catch (e) {}
    return nextSession;
  }, [load]);

  const update = useCallback(async (id, payload) => {
    const response = await api.updateRevisionSession(id, payload);
    await load();
    try { window.dispatchEvent(new CustomEvent("analytics:refresh")); } catch (e) {}
    return response?.session;
  }, [load]);

  const remove = useCallback(async (id) => {
    const response = await api.deleteRevisionSession(id);
    setSessions((current) => current.filter((session) => session._id !== id));
    return response;
  }, []);

  const openSession = useCallback((session) => {
    setSelectedSession(session);
  }, []);

  const closeSession = useCallback(() => {
    setSelectedSession(null);
  }, []);

  const referenceDate = useMemo(() => new Date(now), [now]);
  const liveSessions = useMemo(
    () => sessions.map((session) => api.enrichRevisionSession(session, referenceDate)),
    [sessions, referenceDate]
  );
  const liveTodaySessions = useMemo(
    () => todaySessions.map((session) => api.enrichRevisionSession(session, referenceDate)),
    [todaySessions, referenceDate]
  );
  const liveUpcomingSessions = useMemo(
    () => upcomingSessions.map((session) => api.enrichRevisionSession(session, referenceDate)),
    [upcomingSessions, referenceDate]
  );
  const liveSelectedSession = useMemo(
    () => (selectedSession ? api.enrichRevisionSession(selectedSession, referenceDate) : null),
    [selectedSession, referenceDate]
  );

  const value = useMemo(
    () => ({
      sessions: liveSessions,
      todaySessions: liveTodaySessions,
      upcomingSessions: liveUpcomingSessions,
      revisions: liveSessions,
      selectedSession: liveSelectedSession,
      loading,
      error,
      load,
      create,
      update,
      remove,
      openSession,
      closeSession,
    }),
    [
      liveSessions,
      liveTodaySessions,
      liveUpcomingSessions,
      liveSelectedSession,
      loading,
      error,
      load,
      create,
      update,
      remove,
      openSession,
      closeSession,
    ]
  );

  return (
    <RevisionContext.Provider value={value}>
      {children}
    </RevisionContext.Provider>
  );
}

export function useRevision() {
  const ctx = useContext(RevisionContext);
  if (!ctx) throw new Error("useRevision must be used within RevisionProvider");
  return ctx;
}
