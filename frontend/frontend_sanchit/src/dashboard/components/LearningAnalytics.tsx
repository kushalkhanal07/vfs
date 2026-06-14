import { useEffect, useMemo, useState } from "react";
import { getSubjectMastery, getActivityHeatmap } from "@/api/analytics";

function formatDateKey(date) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getHeatClass(count) {
  // Map counts to blue intensity scale: empty -> blue-50, low->blue-100,... high->blue-900
  if (!count || count === 0) return "bg-blue-50";
  if (count >= 12) return "bg-blue-900";
  if (count >= 8) return "bg-blue-700";
  if (count >= 4) return "bg-blue-500";
  return "bg-blue-100";
}

export default function LearningAnalytics() {
  const [subjects, setSubjects] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [sRes, hRes] = await Promise.all([getSubjectMastery(), getActivityHeatmap(84)]);
        if (!mounted) return;
        setSubjects(sRes.subjects || []);
        setHeatmap(hRes.data || []);
      } catch (e) {
        setError(e.message || "Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    // Poll periodically and listen for explicit refresh events
    const interval = setInterval(() => load(), 30000);
    const onRefresh = () => load();
    window.addEventListener("analytics:refresh", onRefresh);
    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("analytics:refresh", onRefresh);
    };
  }, []);

  // Build last 12 weeks (84 days) array
  const days = useMemo(() => {
    const out = [];
    const today = new Date();
    // start from 83 days ago
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      out.push(formatDateKey(d));
    }
    return out;
  }, []);

  const heatMapByDate = useMemo(() => {
    const map = new Map();
    for (const item of heatmap) map.set(item.date, item.count);
    return map;
  }, [heatmap]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold tracking-tight">Subject Mastery</h3>
          <p className="mb-4 text-xs text-gray-500">Based on recall accuracy</p>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading analytics…</div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-black">{error}</div>
          ) : subjects.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">No data yet</div>
          ) : (
            <div className="space-y-4">
              {subjects.map((s) => (
                <div key={s.subject} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{s.subject}</p>
                    <p className="text-sm text-gray-500">{s.mastery}%</p>
                  </div>
                  <div className="w-full overflow-hidden rounded-full bg-gray-200 h-2.5">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${s.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold tracking-tight">Activity Heatmap</h3>
          <p className="mb-4 text-xs text-gray-500">Last 12 weeks</p>

          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading analytics…</div>
          ) : (
            <div className="grid grid-cols-12 gap-1">
              {days.map((date) => {
                const count = heatMapByDate.get(date) || 0;
                const cls = getHeatClass(count);
                return (
                  <div key={date} className={`h-6 w-6 rounded-md ${cls}`} title={`${date}: ${count} activities`} />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
