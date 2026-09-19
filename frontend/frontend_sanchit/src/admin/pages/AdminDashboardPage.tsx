import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, BookOpen, FileBox, HardDrive, LineChart, ShieldAlert, Users } from "lucide-react";
import { ResponsiveContainer, CartesianGrid, Tooltip, Legend, LineChart as ReLineChart, Line, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { getAdminDashboard } from "@/api/admin";
import { AdminSectionCard, AdminStateCard, LoadingState, StatCard, formatBytes } from "@/admin/components/AdminWidgets";

const COLORS = ["#35ab8b", "#74ccae", "#f59e0b", "#a78bfa", "#34d399", "#fb7185"];

export function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const result = await getAdminDashboard();
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

  const stats = useMemo(() => {
    const summary = data?.summary || {};
    return [
      { label: "Total Users", value: summary.totalUsers || 0, description: `${summary.activeUsers || 0} active`, icon: <Users className="size-4" /> },
      { label: "Total Notes", value: summary.totalNotes || 0, description: `${summary.spamNotesDetected || 0} flagged`, icon: <BookOpen className="size-4" /> },
      { label: "Total Files", value: summary.totalFiles || 0, description: `${summary.spamFilesDetected || 0} blocked`, icon: <FileBox className="size-4" /> },
      { label: "Revision Sessions", value: summary.totalRevisionSessions || 0, description: `${summary.completedRevisions || 0} completed`, icon: <Activity className="size-4" /> },
      { label: "Storage Usage", value: formatBytes(summary.storageUsed || 0), description: `${summary.storagePercent || 0}% used`, icon: <HardDrive className="size-4" /> },
      { label: "Notifications Sent", value: summary.notificationsSent || 0, description: `${summary.missedRevisions || 0} missed revisions`, icon: <ShieldAlert className="size-4" /> },
    ];
  }, [data]);

  const userGrowth = data?.charts?.userGrowthTrend || [];
  const activityTrend = data?.charts?.dailyActivityTrend || [];
  const revisionTrend = data?.charts?.revisionCompletionTrend || [];
  const subjectPopularity = data?.charts?.subjectPopularity || [];
  const storageUsage = data?.charts?.storageUsage || [];

  if (loading) {
    return <LoadingState label="Loading admin dashboard..." />;
  }

  if (!data) {
    return <AdminStateCard title="Dashboard unavailable" description="The analytics service did not return any data." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} tone="from-blue-500/20 to-amber-400/10" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSectionCard title="User Growth Trend" description="New admin and student accounts created over time.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#35ab8b" strokeWidth={3} dot={false} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Daily Activity" description="All platform activity events over the last 30 days.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Legend />
                <Bar dataKey="count" fill="#35ab8b" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <AdminSectionCard title="Revision Completion Trend" description="Completed revision sessions across the last 30 days.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={revisionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Subject Popularity" description="Most active subjects from revision sessions.">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subjectPopularity} dataKey="value" nameKey="label" innerRadius={58} outerRadius={90} paddingAngle={4}>
                  {subjectPopularity.map((entry: any, index: number) => (
                    <Cell key={entry.label || index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>
      </div>

      <AdminSectionCard title="Storage Usage Analytics" description="Top users by storage consumption.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis type="number" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis dataKey="label" type="category" width={120} tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Bar dataKey="value" fill="#34d399" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {storageUsage.slice(0, 5).map((item: any) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.email}</p>
                  </div>
                  <ArrowUpRight className="size-4 text-blue-300" />
                </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-emerald-400" style={{ width: `${Math.min(Number(item.value) || 0, 100)}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{formatBytes(item.storageUsed || 0)} used</span>
                  <span>{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminSectionCard>
    </div>
  );
}
