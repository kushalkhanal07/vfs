import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getAdminFeedback, updateAdminFeedback } from "@/api/admin";
import { AdminPill, AdminStateCard, AdminTable, AdminTableRowEmpty, AdminToolbar, LoadingState } from "@/admin/components/AdminWidgets";
import { toast } from "sonner";
import { Reply } from "lucide-react";

export function AdminFeedbackPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [mutating, setMutating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAdminFeedback();
      setData(result.feedback || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveReply = async () => {
    if (!selected) return;
    setMutating(true);
    try {
      await updateAdminFeedback(selected.id || selected._id, { status: "resolved", adminReply: reply });
      toast.success("Feedback updated");
      setSelected(null);
      setReply("");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update feedback");
    } finally {
      setMutating(false);
    }
  };

  if (loading) return <LoadingState label="Loading feedback..." />;

  return (
    <div className="space-y-6">
      <AdminToolbar title="Feedback" description="Track product feedback, resolve issues, and reply to users." />

      <AdminTable columns={["Subject", "Reporter", "Category", "Status", "Date", "Actions"]}>
        {data.length === 0 ? (
          <TableBody>
            <AdminTableRowEmpty colSpan={6} message="No feedback entries yet." />
          </TableBody>
        ) : (
          <TableBody>
            {data.map((item: any) => (
              <TableRow key={item.id || item._id} className="border-white/10 hover:bg-white/5">
                <TableCell className="px-4 py-4 text-white">
                  <p className="font-medium">{item.subject}</p>
                  <p className="text-xs text-slate-400">{item.message}</p>
                </TableCell>
                <TableCell className="px-4 py-4 text-slate-300">
                  <div>
                    <p>{item.name}</p>
                    <p className="text-xs text-slate-500">{item.email}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4"><AdminPill>{item.category || "Other"}</AdminPill></TableCell>
                <TableCell className="px-4 py-4"><AdminPill tone={item.status === "resolved" ? "success" : "warning"}>{item.status}</AdminPill></TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="px-4 py-4">
                  <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" onClick={() => { setSelected(item); setReply(item.adminReply || ""); }}>
                    <Reply className="mr-2 size-4" />
                    Reply
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </AdminTable>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="border-white/10 bg-slate-950 text-slate-50 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Reply to feedback</DialogTitle>
            <DialogDescription className="text-slate-400">Respond and mark the thread resolved.</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">{selected.subject}</p>
                <p className="mt-2 text-sm text-slate-300">{selected.message}</p>
              </div>
              <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a response..." className="min-h-32 border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" />
              <Button onClick={saveReply} disabled={mutating} className="w-full bg-white text-slate-950 hover:bg-blue-100">Send reply</Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
