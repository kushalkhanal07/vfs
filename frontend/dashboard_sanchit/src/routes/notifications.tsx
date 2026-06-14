import { createFileRoute } from "@tanstack/react-router";
import { Bell, Clock, AlertCircle, CheckCircle2, BookOpen, CalendarClock, Trophy } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

const groups = [
  {
    label: "Today",
    items: [
      { type: "alert", icon: AlertCircle, title: "Revision due in 2 hours", body: "Organic Chemistry — Reactions", time: "2h", tone: "text-destructive bg-destructive/10" },
      { type: "remind", icon: BookOpen, title: "Daily streak reminder", body: "Don't break your 27-day streak — 1 short session does it.", time: "4h", tone: "text-warning bg-warning/10" },
      { type: "ai", icon: CalendarClock, title: "AI rescheduled 'Linear Algebra'", body: "Moved to tomorrow 9 AM based on your sleep pattern.", time: "6h", tone: "text-primary bg-primary/10" },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { type: "win", icon: Trophy, title: "Mastery milestone reached", body: "You hit 90% retention in Mathematics 🎉", time: "1d", tone: "text-success bg-success/10" },
      { type: "done", icon: CheckCircle2, title: "Completed: Cell Cycle revision", body: "Recall accuracy 94% — saved to your vault.", time: "1d", tone: "text-success bg-success/10" },
    ],
  },
  {
    label: "Earlier",
    items: [
      { type: "remind", icon: Clock, title: "Assignment deadline", body: "Physics problem set due in 3 days", time: "3d", tone: "text-warning bg-warning/10" },
      { type: "alert", icon: Bell, title: "New AI insight available", body: "Your weak area: probability — recommended drills ready.", time: "4d", tone: "text-primary bg-primary/10" },
    ],
  },
];

function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Notification Center</h2>
          <p className="text-xs text-muted-foreground">7 unread • stay on top of your study schedule</p>
        </div>
        <button className="text-xs text-primary font-medium hover:underline">Mark all read</button>
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
            {g.items.map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-4 hover:bg-accent/60 transition-colors cursor-pointer">
                <div className={`size-9 rounded-xl grid place-items-center shrink-0 ${n.tone}`}>
                  <n.icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                </div>
                <div className="size-2 rounded-full bg-primary mt-2 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
