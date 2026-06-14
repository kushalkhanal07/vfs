import { useEffect, useState } from "react";
import { ResponsiveContainer, CartesianGrid, Tooltip, LineChart, Line, XAxis, YAxis, BarChart, Bar } from "recharts";
import { getAdminRevisionAnalytics } from "@/api/admin";
import { AdminSectionCard, AdminStateCard, LoadingState, StatCard } from "@/admin/components/AdminWidgets";
import { CheckCircle2, Clock3, Flame, Repeat2, Slash, Target } from "lucide-react";

export function AdminRevisionAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await getAdminRevisionAnalytics();
        if (mounted) setData(result);
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

  if (loading) {
    return <LoadingState label="Loading revision analytics..." />;
  }

  if (!data) {
    return <AdminStateCard title="Revision analytics unavailable" description="The revision service returned no data." />;
  }

  const summary = data.summary || {};
  const trend = data.trend || [];

  const stats = [
    { label: "Total Sessions", value: summary.totalRevisionSessions || 0, description: "All planned sessions", icon: <Repeat2 className="size-4" /> },
    { label: "Completed", value: summary.completedSessions || 0, description: "Successfully finished", icon: <CheckCircle2 className="size-4" /> },
    { label: "Missed", value: summary.missedSessions || 0, description: "Not completed on time", icon: <Slash className="size-4" /> },
    { label: "Upcoming", value: summary.upcomingSessions || 0, description: "Still scheduled", icon: <Clock3 className="size-4" /> },
    { label: "Average Recall", value: `${summary.averageRecallScore || 0}%`, description: "Revision quality score", icon: <Target className="size-4" /> },
    { label: "Study Streak", value: `${summary.currentStreak || 0} days`, description: `Best streak ${summary.longestStreak || 0} days`, icon: <Flame className="size-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} tone="from-amber-400/20 to-blue-400/10" />
        ))}
      </div>

      <AdminSectionCard title="Revision Completion Trend" description="Completed revision sessions over the last 30 days.">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
              <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </AdminSectionCard>

      <AdminSectionCard title="Revision Overview" description="Session distribution by state.">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { label: "Completed", value: summary.completedSessions || 0 },
              { label: "Missed", value: summary.missedSessions || 0 },
              { label: "Upcoming", value: summary.upcomingSessions || 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
              <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AdminSectionCard>
    </div>
  );
}
