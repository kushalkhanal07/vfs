import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import * as api from "@/api/notifications";
import { initSocket, getSocket } from "@/lib/socket";
import { getCurrentUser } from "@/api/user";
import { toast } from "sonner";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications();
      setItems(res.notifications || res || []);
      // Initialize socket after loading notifications and attach listener
      try {
        const user = await getCurrentUser();
        const socket = initSocket(user?.id || user?._id);
        if (socket) {
          socket.off("notification");
          socket.off("session-reminder");
          socket.off("session-starting");
          socket.on("notification", (n) => {
            setItems((s) => {
              // avoid duplicates if already present
              if (s.some((it) => it._id === n._id)) return s;
              return [n, ...s];
            });
          });
          socket.on("session-reminder", (payload) => {
            toast.info(payload.message || "Session reminder");
          });
          socket.on("session-starting", (payload) => {
            toast.success(payload.message || "Session is starting now");
          });
        }
      } catch (e) {
        // don't block - user may be unauthenticated in some contexts
        console.debug("Realtime notifications not initialized:", e?.message || e);
      }
    } catch (e) {
      setError(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("notification");
        socket.off("session-reminder");
        socket.off("session-starting");
      }
    };
  }, []);

  const markRead = useCallback(async (id) => {
    await api.markRead(id);
    setItems((s) => s.map((x) => (x._id === id ? { ...x, isRead: true } : x)));
  }, []);

  return (
    <NotificationsContext.Provider value={{ items, loading, error, load, markRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
