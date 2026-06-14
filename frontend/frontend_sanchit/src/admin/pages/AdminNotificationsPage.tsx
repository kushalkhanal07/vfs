import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import { createAdminNotification, getAdminNotifications } from "@/api/admin";
import { AdminPill, AdminStateCard, AdminTable, AdminTableRowEmpty, AdminToolbar, LoadingState } from "@/admin/components/AdminWidgets";
import { toast } from "sonner";
import { BellRing } from "lucide-react";

export function AdminNotificationsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", message: "", actionUrl: "", broadcast: true, metadata: "" });
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAdminNotifications();
      setHistory(result.notifications || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const send = async () => {
    if (!form.title || !form.message) {
      toast.error("Title and message are required");
      return;
    }

    setSending(true);
    try {
      await createAdminNotification({
        title: form.title,
        message: form.message,
        actionUrl: form.actionUrl || null,
        broadcast: form.broadcast,
        metadata: form.metadata ? JSON.parse(form.metadata) : null,
      });
      toast.success("Notification sent");
      setForm({ title: "", message: "", actionUrl: "", broadcast: true, metadata: "" });
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  if (loading && history.length === 0) return <LoadingState label="Loading notifications..." />;

  return (
    <div className="space-y-6">
      <AdminToolbar title="Notifications" description="Broadcast platform-wide messages or send targeted alerts.">
        <BellRing className="size-5 text-blue-300" />
      </AdminToolbar>

      <div className="space-y-6">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">Compose notification</h3>
          <Input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} placeholder="Title" className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" />
          <Textarea value={form.message} onChange={(e) => setForm((current) => ({ ...current, message: e.target.value }))} placeholder="Message" className="min-h-32 border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" />
          <Input value={form.actionUrl} onChange={(e) => setForm((current) => ({ ...current, actionUrl: e.target.value }))} placeholder="Action URL (optional)" className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" />
          <Textarea value={form.metadata} onChange={(e) => setForm((current) => ({ ...current, metadata: e.target.value }))} placeholder='Metadata JSON e.g. {"priority":"high"}' className="min-h-24 border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" />
          <Button onClick={send} disabled={sending} className="w-full bg-white text-slate-950 hover:bg-blue-100">
            {sending ? "Sending..." : "Send notification"}
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Notification history</h3>
        <AdminTable columns={["Title", "User", "Type", "Read", "Date"]}>
          {history.length === 0 ? (
            <AdminTableRowEmpty colSpan={5} message="No notification history yet." />
          ) : (
            <>
              {history.map((item: any) => (
                <TableRow key={item._id || item.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="px-4 py-4 text-white">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.message}</p>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-slate-300">
                    <div>
                      <p>{item.userName || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{item.userEmail || ""}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4"><AdminPill>{item.type || "system"}</AdminPill></TableCell>
                  <TableCell className="px-4 py-4"><AdminPill tone={item.isRead ? "success" : "warning"}>{item.isRead ? "Read" : "Unread"}</AdminPill></TableCell>
                  <TableCell className="px-4 py-4 text-slate-300">{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </>
          )}
        </AdminTable>
        </div>
      </div>
    </div>
  );
}
