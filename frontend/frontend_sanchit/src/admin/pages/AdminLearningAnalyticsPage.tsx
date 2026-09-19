import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, CartesianGrid, Tooltip, Legend, LineChart, Line, XAxis, YAxis, BarChart, Bar } from "recharts";
import { getAdminLearningAnalytics, getAdminProductivityAnalytics } from "@/api/admin";
import { AdminSectionCard, AdminStateCard, LoadingState, StatCard } from "@/admin/components/AdminWidgets";
import { Award, Brain, Clock3, Flame, Layers3, Trophy } from "lucide-react";

export function AdminLearningAnalyticsPage() {
  const [masteryData, setMasteryData] = useState<any>(null);
  const [productivityData, setProductivityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [mastery, productivity] = await Promise.all([
          getAdminLearningAnalytics(),
          getAdminProductivityAnalytics(),
        ]);
        if (mounted) {
          setMasteryData(mastery);
          setProductivityData(productivity);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const leaderboard = masteryData?.leaderboard || [];
    const productivity = productivityData?.productivity || [];
    const masteries = masteryData?.mastery || [];
    const avgMastery = masteries.length ? Math.round(masteries.reduce((sum: number, item: any) => sum + (item.mastery || 0), 0) / masteries.length) : 0;
    const totalReviews = leaderboard.reduce((sum: number, item: any) => sum + (item.totalReviews || 0), 0);
    const activeSubjects = masteries.length;
    const focusMinutes = productivity.reduce((sum: number, item: any) => sum + (item.focusMinutes || 0), 0);
    return [
      { label: "Average Mastery", value: `${avgMastery}%`, description: `${activeSubjects} subjects`, icon: <Brain className="size-4" /> },
      { label: "Total Reviews", value: totalReviews, description: "Across all active learners", icon: <Award className="size-4" /> },
      { label: "Focus Minutes", value: focusMinutes, description: "Last 30 days", icon: <Clock3 className="size-4" /> },
      { label: "Top Learners", value: leaderboard.length, description: "Leaderboard entries", icon: <Trophy className="size-4" /> },
    ];
  }, [masteryData, productivityData]);

  if (loading) {
    return <LoadingState label="Loading learning analytics..." />;
  }

  if (!masteryData || !productivityData) {
    return <AdminStateCard title="Learning analytics unavailable" description="The admin analytics service returned no data." />;
  }

  const mastery = masteryData.mastery || [];
  const revisions = masteryData.revisions || [];
  const productivity = productivityData.productivity || [];
  const leaderboard = masteryData.leaderboard || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} tone="from-blue-500/20 to-violet-400/10" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSectionCard title="Subject Mastery" description="Average mastery across the most active subjects.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mastery}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="subject" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Bar dataKey="mastery" fill="#35ab8b" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Revision Success Rate" description="Status split across revision sessions.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revisions}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="status" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminSectionCard title="Learning Consistency" description="Activity and focus trend over time.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Legend />
                <Line type="monotone" dataKey="activities" stroke="#35ab8b" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="focusMinutes" stroke="#34d399" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Top Learners" description="Users with the highest mastery averages.">
          <div className="space-y-3">
            {leaderboard.slice(0, 8).map((item: any, index: number) => (
              <div key={`${item.userId || item.email || index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{item.name || item.email || "Learner"}</p>
                    <p className="text-xs text-slate-400">{item.email || "No email available"}</p>
                  </div>
                  <div className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-100">
                    #{index + 1}
                  </div>
                </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400" style={{ width: `${item.mastery || 0}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{item.mastery || 0}% mastery</span>
                  <span>{item.totalReviews || 0} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
