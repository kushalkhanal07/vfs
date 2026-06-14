import { Bell, Clock, AlertCircle, CheckCircle2, BookOpen, CalendarClock, Trophy } from "lucide-react";
import { useMemo } from "react";
import { useNotifications } from "@/contexts/notificationsContext";
import * as api from "@/api/notifications";

function timeAgo(dateStr: string | Date) {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const day = Math.floor(h / 24);
  if (s < 60) return `${s}s`;
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  return `${day}d`;
}

function typeToIcon(type: string) {
  switch (type) {
    case "revision_reminder":
      return CalendarClock;
    case "missed_revision":
      return AlertCircle;
    case "study_streak":
      return Trophy;
    case "deadline_reminder":
      return Clock;
    case "upload_success":
      return CheckCircle2;
    case "learning_recommendation":
      return BookOpen;
    default:
      return Bell;
  }
}

function typeToTone(type: string) {
  switch (type) {
    case "revision_reminder":
    case "deadline_reminder":
      return "text-warning bg-warning/10";
    case "study_streak":
    case "upload_success":
      return "text-success bg-success/10";
    case "learning_recommendation":
      return "text-primary bg-primary/10";
    case "missed_revision":
      return "text-destructive bg-destructive/10";
    default:
      return "text-muted-foreground bg-muted/10";
  }
}

export function NotificationsPage() {
  const { items, loading, error, load, markRead } = useNotifications();

  const groups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const g = { Today: [], Yesterday: [], Earlier: [] } as Record<string, any[]>;

    (items || []).forEach((n: any) => {
      const d = new Date(n.createdAt || n.scheduledAt || Date.now());
      const dkey = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (dkey.getTime() === today.getTime()) g.Today.push(n);
      else if (dkey.getTime() === yesterday.getTime()) g.Yesterday.push(n);
      else g.Earlier.push(n);
    });

    return [
      { label: "Today", items: g.Today },
      { label: "Yesterday", items: g.Yesterday },
      { label: "Earlier", items: g.Earlier },
    ];
  }, [items]);

  const handleMarkAll = async () => {
    try {
      await api.markAllAsRead();
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Notification Center</h2>
          <p className="text-xs text-muted-foreground">{(items || []).filter((i: any) => !i.isRead).length} unread • stay on top of your study schedule</p>
        </div>
        <button onClick={handleMarkAll} className="text-xs text-primary font-medium hover:underline">
          Mark all read
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All", "Reminders", "Revisions", "Deadlines", "Insights"].map((t, i) => (
          <button
            key={t}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              i === 0 ? "gradient-primary text-primary-foreground shadow-soft" : "glass hover:bg-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {groups.map((g) => (
        <div key={g.label} className="space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium px-1">{g.label}</p>
          <div className="glass rounded-2xl divide-y divide-border overflow-hidden">
            {g.items.map((n: any) => {
              const Icon = typeToIcon(n.type || "");
              const tone = typeToTone(n.type || "");
              const unread = !n.isRead;

              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkRead(n._id)}
                  className={`flex items-start gap-3 p-4 hover:bg-accent/60 transition-colors cursor-pointer ${unread ? "bg-muted/5" : ""}`}
                >
                  <div className={`size-9 rounded-xl grid place-items-center shrink-0 ${tone}`}>
                    {/* @ts-ignore */}
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                  {unread && <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
