import { useEffect, useState } from "react";
import { ResponsiveContainer, CartesianGrid, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line } from "recharts";
import { getAdminSearchAnalytics } from "@/api/admin";
import { AdminSectionCard, AdminStateCard, LoadingState, StatCard } from "@/admin/components/AdminWidgets";
import { ArrowUpRight, Search, ShieldAlert, WandSparkles } from "lucide-react";

export function AdminSearchAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await getAdminSearchAnalytics();
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
    return <LoadingState label="Loading search analytics..." />;
  }

  if (!data) {
    return <AdminStateCard title="Search analytics unavailable" description="No search data was returned from the server." />;
  }

  const summary = data.summary || {};
  const topQueries = data.topQueries || [];
  const failedSearches = data.failedSearches || [];
  const userSearches = data.userSearches || [];

  const stats = [
    { label: "Searches", value: summary.totalSearches || 0, description: "All recorded queries", icon: <Search className="size-4" /> },
    { label: "Success Rate", value: `${summary.successRate || 0}%`, description: "Queries with results", icon: <WandSparkles className="size-4" /> },
    { label: "Failed Searches", value: summary.failedSearches || 0, description: "No result queries", icon: <ShieldAlert className="size-4" /> },
    { label: "Success Hits", value: summary.successSearches || 0, description: "Queries that returned results", icon: <ArrowUpRight className="size-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} tone="from-blue-500/20 to-fuchsia-400/10" />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSectionCard title="Most Searched Keywords" description="Queries with the highest frequency across the platform.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topQueries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="query" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Bar dataKey="count" fill="#35ab8b" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Search Success Rate" description="Success and failure trends from search history.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { label: "Success", value: summary.successSearches || 0 },
                { label: "Failed", value: summary.failedSearches || 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSectionCard title="Failed Searches" description="Repeated queries that did not return results.">
          <div className="space-y-3">
            {failedSearches.slice(0, 8).map((item: any, index: number) => (
              <div key={`${item.query}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{item.query}</p>
                    <p className="text-xs text-slate-400">{item.count} times</p>
                  </div>
                  <ShieldAlert className="size-4 text-rose-300" />
                </div>
              </div>
            ))}
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Top Searchers" description="Users with the highest search frequency.">
          <div className="space-y-3">
            {userSearches.slice(0, 8).map((item: any, index: number) => (
              <div key={`${item.userId || index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{item.name || item.email || "User"}</p>
                    <p className="text-xs text-slate-400">{item.searches} searches</p>
                  </div>
                  <ArrowUpRight className="size-4 text-blue-300" />
                </div>
              </div>
            ))}
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );
}
