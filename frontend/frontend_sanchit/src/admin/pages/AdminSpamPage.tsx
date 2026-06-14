import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getAdminSpam, getAdminSpamIncident, reviewAdminSpamIncident } from "@/api/admin";
import { AdminPill, AdminSearchBar, AdminStateCard, AdminTable, AdminTableRowEmpty, AdminToolbar, LoadingState } from "@/admin/components/AdminWidgets";
import { toast } from "sonner";
import { Eye, ShieldAlert, ShieldCheck } from "lucide-react";

const reviewStates = ["reviewed", "false_positive", "allowed"];

export function AdminSpamPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [mutating, setMutating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAdminSpam({ page: 1, limit: 15 });
      setData(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load spam records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedId) {
        setSelectedIncident(null);
        return;
      }

      setDetailLoading(true);
      try {
        const incident = await getAdminSpamIncident(selectedId);
        setSelectedIncident(incident);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load spam incident");
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  }, [selectedId]);

  const items = (data?.items || []).filter((item: any) => {
    const matchesSearch = !search || [item.fileName, item.title, item.userName, item.userEmail].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = status === "all" || item.status === status;
    return matchesSearch && matchesStatus;
  });

  const updateReview = async (nextStatus: string) => {
    if (!selectedId) return;
    setMutating(true);
    try {
      await reviewAdminSpamIncident(selectedId, { status: nextStatus, notes: selectedIncident?.notes || "" });
      toast.success("Spam record updated");
      await load();
      const incident = await getAdminSpamIncident(selectedId);
      setSelectedIncident(incident);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update spam record");
    } finally {
      setMutating(false);
    }
  };

  if (loading && items.length === 0) {
    return <LoadingState label="Loading spam monitoring..." />;
  }

  return (
    <div className="space-y-6">
      <AdminToolbar title="Spam Detection" description="Inspect blocked uploads, false positives, and suspicious moderation events.">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[170px] border-white/10 bg-white/5 text-slate-100">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="false_positive">False positive</SelectItem>
            <SelectItem value="allowed">Allowed</SelectItem>
          </SelectContent>
        </Select>
      </AdminToolbar>

      <AdminSearchBar value={search} onChange={setSearch} placeholder="Search files, titles, or users" />

      <AdminTable columns={["File / Item", "User", "Spam Score", "Reason", "Status", "Date", "Actions"]}>
        {items.length === 0 ? (
          <TableBody>
            <AdminTableRowEmpty colSpan={7} message="No spam incidents match the current filters." />
          </TableBody>
        ) : (
          <TableBody>
            {items.map((item: any) => (
              <TableRow key={item._id || item.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="px-4 py-4">
                  <p className="font-medium text-white">{item.fileName || item.title || item.itemId}</p>
                  <p className="text-xs text-slate-400">{item.itemType}</p>
                </TableCell>
                <TableCell className="px-4 py-4 text-slate-300">
                  <div>
                    <p>{item.userName || "Unknown"}</p>
                    <p className="text-xs text-slate-500">{item.userEmail || ""}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{item.spamScore}</TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{(item.reasons || []).join(", ") || "n/a"}</TableCell>
                <TableCell className="px-4 py-4"><AdminPill tone={item.status === "false_positive" ? "success" : item.status === "blocked" ? "danger" : "default"}>{item.status}</AdminPill></TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="px-4 py-4">
                  <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" onClick={() => setSelectedId(item._id || item.id)}>
                    <Eye className="mr-2 size-4" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </AdminTable>

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-slate-950 text-slate-50 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Spam incident</DialogTitle>
            <DialogDescription className="text-slate-400">Review the moderation record and classify the upload.</DialogDescription>
          </DialogHeader>
          {detailLoading || !selectedIncident ? (
            <LoadingState label="Loading incident..." />
          ) : (
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">{selectedIncident.fileName || selectedIncident.title || selectedIncident.itemId}</p>
                <p className="mt-2 text-2xl font-semibold text-white">Spam score {selectedIncident.spamScore}</p>
                <p className="mt-1 text-sm text-slate-300">{(selectedIncident.reasons || []).join(", ") || "No reasons recorded"}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {reviewStates.map((item) => (
                  <Button key={item} variant="outline" onClick={() => updateReview(item)} disabled={mutating} className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
                    {item === "false_positive" ? <ShieldCheck className="mr-2 size-4" /> : <ShieldAlert className="mr-2 size-4" />}
                    {item.replace("_", " ")}
                  </Button>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                <p className="font-medium text-white">User</p>
                <p>{selectedIncident.user?.name || selectedIncident.userName || "Unknown"}</p>
                <p className="text-xs text-slate-500">{selectedIncident.user?.email || selectedIncident.userEmail || ""}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
