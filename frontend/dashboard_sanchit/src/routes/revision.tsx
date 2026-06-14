import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ListChecks, Flame, Brain, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/revision")({
  component: RevisionPage,
});

const week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = [5, 6, 7, 8, 9, 10, 11];

const sessions = [
  { day: 0, title: "Algebra Recap", priority: "high", time: "9:00", duration: "45m", subject: "Math" },
  { day: 0, title: "Photosynthesis", priority: "medium", time: "16:00", duration: "30m", subject: "Bio" },
  { day: 1, title: "Newton's Laws", priority: "high", time: "10:00", duration: "60m", subject: "Physics" },
  { day: 2, title: "Big-O Notation", priority: "low", time: "14:00", duration: "20m", subject: "CS" },
  { day: 3, title: "WW2 Causes", priority: "medium", time: "11:00", duration: "40m", subject: "History" },
  { day: 5, title: "Mock Test", priority: "high", time: "9:00", duration: "120m", subject: "All" },
  { day: 6, title: "Review week", priority: "low", time: "18:00", duration: "30m", subject: "All" },
];

const priorityColor = (p: string) =>
  p === "high"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : p === "medium"
      ? "bg-warning/15 text-warning border-warning/30"
      : "bg-success/15 text-success border-success/30";

function RevisionPage() {
  const [view, setView] = useState<"week" | "list">("week");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Sessions today", value: "4", icon: ListChecks, tone: "from-indigo-400 to-purple-500" },
          { label: "Streak", value: "27d", icon: Flame, tone: "from-orange-400 to-pink-500" },
          { label: "Retention", value: "92%", icon: Brain, tone: "from-emerald-400 to-teal-500" },
          { label: "This week", value: "+18%", icon: TrendingUp, tone: "from-cyan-400 to-blue-500" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 hover-lift">
            <div className={`size-9 rounded-xl bg-gradient-to-br ${s.tone} grid place-items-center text-white`}>
              <s.icon className="size-4" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">{s.label}</p>
            <p className="text-2xl font-semibold mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Spaced Repetition Schedule</h2>
          <p className="text-xs text-muted-foreground">May 5 – May 11, 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center glass rounded-xl p-1">
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Week
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Timeline
            </button>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-xl gradient-primary text-primary-foreground px-3.5 py-2 text-sm font-medium">
            <Plus className="size-4" /> Add session
          </button>
        </div>
      </div>

      {view === "week" ? (
        <div className="glass rounded-2xl p-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {week.map((d, i) => (
              <div key={d} className="space-y-2">
                <div className={`text-center pb-2 border-b ${i === 5 ? "border-primary" : "border-border"}`}>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{d}</p>
                  <p className={`text-lg font-semibold ${i === 5 ? "text-primary" : ""}`}>{dates[i]}</p>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {sessions
                    .filter((s) => s.day === i)
                    .map((s) => (
                      <div
                        key={s.title}
                        className={`rounded-xl p-2.5 border ${priorityColor(s.priority)} hover-lift cursor-pointer`}
                      >
                        <p className="text-[11px] font-semibold opacity-80">{s.time}</p>
                        <p className="text-xs font-medium mt-0.5 leading-tight">{s.title}</p>
                        <p className="text-[10px] opacity-70 mt-1">{s.subject} • {s.duration}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-border overflow-hidden">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-accent/60 transition-colors">
              <div className="text-center w-14 shrink-0">
                <p className="text-[11px] uppercase text-muted-foreground">{week[s.day]}</p>
                <p className="text-lg font-semibold">{dates[s.day]}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-[11px] text-muted-foreground">{s.subject} • {s.time} • {s.duration}</p>
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md border ${priorityColor(s.priority)}`}>
                {s.priority}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold tracking-tight mb-1">Subject Mastery</h3>
          <p className="text-xs text-muted-foreground mb-4">Based on recall accuracy</p>
          <div className="space-y-3">
            {[
              { name: "Mathematics", value: 92 },
              { name: "Physics", value: 81 },
              { name: "Chemistry", value: 74 },
              { name: "Biology", value: 88 },
              { name: "History", value: 65 },
            ].map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground tabular-nums">{s.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold tracking-tight mb-1">Activity Heatmap</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 12 weeks</p>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 84 }).map((_, i) => {
              const intensity = Math.floor(Math.random() * 5);
              const opacity = [0.08, 0.25, 0.5, 0.75, 1][intensity];
              return (
                <div
                  key={i}
                  className="aspect-square rounded-md gradient-primary"
                  style={{ opacity }}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3" />
            <span>Less</span>
            <div className="flex gap-1">
              {[0.15, 0.4, 0.65, 0.9].map((o, i) => (
                <div key={i} className="size-3 rounded gradient-primary" style={{ opacity: o }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
