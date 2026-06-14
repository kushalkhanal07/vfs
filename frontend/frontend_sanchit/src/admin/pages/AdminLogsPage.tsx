import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { getAdminLogs } from "@/api/admin";
import { AdminPill, AdminStateCard, AdminTable, AdminTableRowEmpty, AdminToolbar, LoadingState } from "@/admin/components/AdminWidgets";
import { Shield, FileUp, Search, Repeat2, BellRing, ShieldCheck } from "lucide-react";

const logTypes = ["all", "login", "file_upload", "search", "revision", "notification", "admin_action"];

function formatLogDetails(details: Record<string, any> | string | null | undefined) {
  if (!details) return [];
  if (typeof details === "string") {
    return [{ label: "Details", value: details }];
  }

  return Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([label, value]) => ({
      label,
      value: typeof value === "object" ? JSON.stringify(value) : String(value),
    }));
}

export function AdminLogsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const result = await getAdminLogs();
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

  const items = useMemo(() => {
    const rows = data?.items || [];
    return type === "all" ? rows : rows.filter((item: any) => item.event === type);
  }, [data, type]);

  if (loading) return <LoadingState label="Loading system logs..." />;

  return (
    <div className="space-y-6">
      <AdminToolbar title="System Logs" description="Monitor login, upload, search, revision, and admin action trails.">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-47.5 border-white/10 bg-white/5 text-slate-100">
            <SelectValue placeholder="Log type" />
          </SelectTrigger>
          <SelectContent>
            {logTypes.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminToolbar>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Logins", value: data?.counts?.logins || 0, icon: <Shield className="size-4" /> },
          { label: "Uploads", value: data?.counts?.uploads || 0, icon: <FileUp className="size-4" /> },
          { label: "Searches", value: data?.counts?.searches || 0, icon: <Search className="size-4" /> },
          { label: "Revisions", value: data?.counts?.revisions || 0, icon: <Repeat2 className="size-4" /> },
          { label: "Notifications", value: data?.counts?.notifications || 0, icon: <BellRing className="size-4" /> },
          { label: "Admin Actions", value: data?.counts?.adminActions || 0, icon: <ShieldCheck className="size-4" /> },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="grid size-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200">{item.icon}</div>
            <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <AdminTable columns={["Event", "User", "Details", "Date"]}>
        {items.length === 0 ? (
          <AdminTableRowEmpty colSpan={4} message="No logs match the current filter." />
        ) : (
          <>
            {items.map((item: any, index: number) => {
              const detailsRows = formatLogDetails(item.details);

              return (
                <TableRow key={`${item.event}-${index}`} className="border-white/10 hover:bg-white/5">
                  <TableCell className="px-4 py-4 align-top">
                    <AdminPill>{item.event}</AdminPill>
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top text-slate-300">
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-900 dark:text-white">{item.userName || item.details?.action || "System"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.userEmail || ""}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top text-slate-300">
                    {detailsRows.length === 0 ? (
                      <span className="text-slate-500 dark:text-slate-400">No details available</span>
                    ) : (
                      <div className="space-y-2">
                        {detailsRows.map((detail) => (
                          <div key={`${item.event}-${index}-${detail.label}`} className="flex gap-3 text-sm">
                            <span className="min-w-24 shrink-0 text-slate-500 dark:text-slate-400">{detail.label}</span>
                            <span className="wrap-break-word text-slate-900 dark:text-slate-100">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-4 align-top text-slate-300">
                    {new Date(item.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </>
        )}
      </AdminTable>
    </div>
  );
}
