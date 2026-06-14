import { createFileRoute } from "@tanstack/react-router";
import {
  Flame,
  BookOpen,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
  FileText,
  Brain,
  Target,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const stats = [
  { label: "Study Streak", value: "27", suffix: "days", icon: Flame, tone: "from-orange-400 to-pink-500" },
  { label: "Notes Created", value: "184", suffix: "this month", icon: FileText, tone: "from-indigo-400 to-purple-500" },
  { label: "Hours Focused", value: "42.5", suffix: "this week", icon: Clock, tone: "from-cyan-400 to-blue-500" },
  { label: "Mastery Score", value: "87%", suffix: "+4% ↑", icon: TrendingUp, tone: "from-emerald-400 to-teal-500" },
];

const upcoming = [
  { title: "Organic Chemistry — Reactions", due: "Today, 6:00 PM", priority: "high", subject: "Chemistry" },
  { title: "Linear Algebra — Eigenvectors", due: "Tomorrow, 9:00 AM", priority: "medium", subject: "Math" },
  { title: "World History — Cold War", due: "Wed, 4:00 PM", priority: "low", subject: "History" },
  { title: "Data Structures — Trees", due: "Thu, 11:00 AM", priority: "medium", subject: "CS" },
];

const recent = [
  { title: "Photosynthesis — Light Reactions", time: "2h ago", icon: BookOpen },
  { title: "Calculus Cheatsheet v3", time: "Yesterday", icon: FileText },
  { title: "Macroeconomics — Lecture 12", time: "2 days ago", icon: BookOpen },
];

const recommendations = [
  { title: "Review Newton's Laws", reason: "Due for spaced repetition", icon: Brain },
  { title: "Practice 10 SAT problems", reason: "Boost weak area: probability", icon: Target },
  { title: "Re-read 'Cell Cycle' notes", reason: "Quiz next week", icon: Sparkles },
];

const weeklyData = [3, 5, 4, 7, 6, 8, 5];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Dashboard() {
  const max = Math.max(...weeklyData);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary p-6 md:p-8 text-primary-foreground shadow-elegant">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-80">Sunday, May 10</p>
            <h1 className="text-2xl md:text-3xl font-semibold mt-1 tracking-tight">
              Good evening, Aarav 🌙
            </h1>
            <p className="text-sm opacity-90 mt-2 max-w-md">
              You've got <b>4 revisions</b> queued and a <b>27-day streak</b>.
              One more session keeps the fire alive.
            </p>
          </div>
          <button className="self-start md:self-auto inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md rounded-xl px-4 py-2.5 text-sm font-medium">
            Start focus session
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass rounded-2xl p-4 hover-lift relative overflow-hidden"
          >
            <div className={`absolute -right-4 -top-4 size-20 rounded-full bg-gradient-to-br ${s.tone} opacity-20 blur-2xl`} />
            <div className={`size-9 rounded-xl bg-gradient-to-br ${s.tone} grid place-items-center text-white shadow-soft`}>
              <s.icon className="size-4" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">{s.label}</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.suffix}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly chart */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold tracking-tight">Weekly Focus</h3>
              <p className="text-xs text-muted-foreground">Hours spent per day</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-lg bg-success/15 text-success font-medium">
              +18% vs last week
            </span>
          </div>
          <div className="flex items-end gap-3 h-44">
            {weeklyData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl gradient-primary opacity-90 hover:opacity-100 transition-opacity relative group"
                  style={{ height: `${(v / max) * 100}%` }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {v}h
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Recs */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg gradient-primary grid place-items-center text-white">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="font-semibold tracking-tight text-sm">Smart Recommendations</h3>
              <p className="text-[11px] text-muted-foreground">Tailored by AI</p>
            </div>
          </div>
          <div className="space-y-2">
            {recommendations.map((r) => (
              <div key={r.title} className="rounded-xl p-3 hover:bg-accent/60 transition-colors cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
                    <r.icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-[11px] text-muted-foreground">{r.reason}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Revisions */}
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Upcoming Revisions</h3>
            <button className="text-xs text-primary font-medium hover:underline">View all</button>
          </div>
          <div className="space-y-2">
            {upcoming.map((u) => (
              <div
                key={u.title}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/60 transition-colors group"
              >
                <button className="size-5 rounded-full border-2 border-border hover:border-primary transition-colors grid place-items-center">
                  <CheckCircle2 className="size-3 opacity-0 group-hover:opacity-100 text-primary" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.title}</p>
                  <p className="text-[11px] text-muted-foreground">{u.subject} • {u.due}</p>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md ${
                    u.priority === "high"
                      ? "bg-destructive/15 text-destructive"
                      : u.priority === "medium"
                        ? "bg-warning/15 text-warning"
                        : "bg-success/15 text-success"
                  }`}
                >
                  {u.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold tracking-tight mb-4">Recent Notes</h3>
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.title} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/60 transition-colors cursor-pointer">
                <div className="size-9 rounded-lg gradient-soft grid place-items-center text-primary">
                  <r.icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground">{r.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Goal Progress</p>
            <div className="flex justify-between text-sm font-medium mb-1.5">
              <span>50h Weekly Target</span>
              <span className="text-primary">42.5/50h</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full gradient-primary rounded-full transition-all" style={{ width: "85%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
