import {
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import LearningAnalytics from "@/dashboard/components/LearningAnalytics";
import { StorageWidget } from "@/dashboard/components/StorageWidget";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import * as dashboardApi from "@/api/dashboard";
import * as revisionApi from "@/api/revision";
import { getUserProfile } from "@/api/user";

const defaultStats = [
  { label: "Study Streak", value: "0", suffix: "days", icon: Flame, tone: "from-gray-200 to-gray-500" },
  { label: "Notes Created", value: "0", suffix: "this month", icon: FileText, tone: "from-gray-200 to-gray-500" },
  { label: "Hours Focused", value: "0", suffix: "this week", icon: Clock, tone: "from-gray-200 to-gray-500" },
  { label: "Mastery Score", value: "0%", suffix: "", icon: TrendingUp, tone: "from-gray-200 to-gray-500" },
];

// recommendations fetched from API

export function DashboardHomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [metricsRes, recRes, upcomingRes, profileRes] = await Promise.all([
          dashboardApi.getDashboardMetrics().catch(() => null),
          dashboardApi.getLearningRecommendations().catch(() => ({ })),
          revisionApi.getUpcomingRevisions(7).catch(() => null),
          getUserProfile().catch(() => null),
        ]);

        const metrics = metricsRes || null;

        // profile greeting
        if (profileRes && profileRes.name) {
          const name = profileRes.name || "";
          const first = name.split(" ")[0] || name;
          setFirstName(first);
          const hr = new Date().getHours();
          let greet = "Good night";
          if (hr >= 5 && hr < 12) greet = "Good morning";
          else if (hr >= 12 && hr < 17) greet = "Good afternoon";
          else if (hr >= 17 && hr < 21) greet = "Good evening";
          setGreeting(greet);
        }

        if (!mounted) return;

        if (metrics) {
          setStats([
            { label: "Study Streak", value: String(metrics.studyStreak || 0), suffix: "days", icon: Flame, tone: "from-gray-200 to-gray-500" },
            { label: "Notes Created", value: String(metrics.notesCreatedThisMonth || 0), suffix: "this month", icon: FileText, tone: "from-gray-200 to-gray-500" },
            { label: "Hours Focused", value: String(metrics.hoursFocusedThisWeek || 0), suffix: "this week", icon: Clock, tone: "from-gray-200 to-gray-500" },
            { label: "Mastery Score", value: `${metrics.masteryScore || 0}%`, suffix: "", icon: TrendingUp, tone: "from-gray-200 to-gray-500" },
          ]);
        }

        // normalize recommendations into simple items with title and reason
        const recItems = [];
        if (recRes) {
          if (recRes.reviewAgain && Array.isArray(recRes.reviewAgain)) {
            recRes.reviewAgain.forEach((r) => recItems.push({ title: r.contentId ? `Review content ${r.contentId}` : "Review item", reason: "Due for spaced repetition", icon: Brain }));
          }
          if (recRes.oldNotes && Array.isArray(recRes.oldNotes)) {
            recRes.oldNotes.forEach((n) => recItems.push({ title: n.title || "Old note", reason: "Stale note", icon: Sparkles }));
          }
          if (recRes.unvisitedNotes && Array.isArray(recRes.unvisitedNotes)) {
            recRes.unvisitedNotes.forEach((n) => recItems.push({ title: n.title || "Unvisited note", reason: "Not visited recently", icon: Sparkles }));
          }
        }
        setRecommendations(recItems.slice(0, 5));

        // upcomingRes may be { grouped } or array; normalize to simple list
        const list = [];
        if (upcomingRes) {
          if (upcomingRes.grouped) {
            Object.values(upcomingRes.grouped).forEach((arr) => list.push(...arr));
          } else if (Array.isArray(upcomingRes.sessions)) {
            list.push(...upcomingRes.sessions);
          } else if (Array.isArray(upcomingRes)) {
            list.push(...upcomingRes);
          }
        }
        setUpcoming(list.slice(0, 5));
      } catch (e) {
        console.error("Failed to load dashboard metrics", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 text-black shadow-none md:p-8">
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-black/5 blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-64 rounded-full bg-black/5 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Integrated Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {loading || !greeting || !firstName ? (
                <span className="inline-block h-6 w-48 animate-pulse rounded bg-white/30" />
              ) : (
                `${greeting}, ${firstName}`
              )}
            </h1>
            <p className="mt-2 max-w-md text-sm text-gray-600">
              You have 4 revisions queued and a 27-day streak. This dashboard now runs in the same
              app as your frontend.
            </p>
          </div>
          <button 
            onClick={() => navigate({ to: "/session/setup" })}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-100 md:self-auto">
            Start focus session
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="relative overflow-hidden rounded-md border border-blue-200 bg-blue-600 p-4 shadow-sm text-white">
              <div className="absolute -right-4 -top-4 size-20 rounded-full bg-blue-50 opacity-75 blur-2xl" />
              <div className="grid size-9 place-items-center rounded-xl bg-blue-700 text-white">
                <stat.icon className="size-4" />
              </div>
              <p className="mt-3 text-xs text-blue-100">{stat.label}</p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <p className="text-2xl font-mono font-semibold tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-blue-100">{stat.suffix}</p>
              </div>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-none">
          <h3 className="font-semibold tracking-tight">Upcoming Revisions</h3>
          <p className="mb-4 text-xs text-gray-500">
            Tasks from your current revision plan
          </p>
          <div className="space-y-2">
            {loading ? (
              <div className="py-4 text-sm text-gray-500">Loading…</div>
            ) : upcoming.length === 0 ? (
              <div className="py-4 text-sm text-gray-500">No upcoming revisions</div>
            ) : (
              upcoming.slice(0, 5).map((session) => (
                <div key={session._id || session.id} className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-100">
                  <button className="grid size-5 place-items-center rounded-full border-2 border-gray-200 transition-colors hover:border-black">
                    <CheckCircle2 className="size-3 opacity-0 text-black group-hover:opacity-100" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{session.title || session.content?.title || session.content?.name || "Revision"}</p>
                    <p className="text-[11px] text-gray-500">{new Date(session.revisionDate || session.nextReviewDate || session.scheduledAt || session.createdAt).toDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-none">
          <h3 className="font-semibold tracking-tight">Smart Recommendations</h3>
          <p className="mb-4 text-xs text-gray-500">Generated from your activity</p>
          <div className="space-y-2">
            {recommendations.map((item) => (
              <div
                key={item.title}
                className="group flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors hover:bg-gray-100"
              >
                <div className="grid size-8 place-items-center rounded-lg bg-gray-100 text-black">
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-[11px] text-gray-500">{item.reason}</p>
                </div>
                <ChevronRight className="size-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-none">
          <StorageWidget />
        </div>
      </div>
      
      <div className="mt-4">
        <LearningAnalytics />
      </div>
    </div>
  );
}
