import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { createAdminSubject, deleteAdminSubject, getAdminSubjects, updateAdminSubject } from "@/api/admin";
import { AdminPill, AdminStateCard, AdminTable, AdminTableRowEmpty, AdminToolbar, LoadingState } from "@/admin/components/AdminWidgets";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function AdminSubjectsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#3b82f6", active: true, order: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAdminSubjects();
      setData(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", color: "#3b82f6", active: true, order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (subject: any) => {
    setEditing(subject);
    setDialogOpen(true);
    setForm({
      name: subject.name || "",
      description: subject.description || "",
      color: subject.color || "#3b82f6",
      active: subject.active !== false,
      order: subject.order || 0,
    });
  };

  const save = async () => {
    try {
      if (editing) {
        await updateAdminSubject(editing.id || editing._id, form);
        toast.success("Subject updated");
      } else {
        await createAdminSubject(form);
        toast.success("Subject created");
      }
      await load();
      setEditing(null);
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save subject");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await deleteAdminSubject(id);
      toast.success("Subject deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete subject");
    }
  };

  if (loading) return <LoadingState label="Loading subjects..." />;

  const subjects = data?.subjects || [];

  return (
    <div className="space-y-6">
      <AdminToolbar title="Subject Management" description="Add, edit, activate, and deactivate academic subjects.">
        <Button onClick={openCreate} className="bg-white text-slate-950 hover:bg-blue-100">
          <Plus className="mr-2 size-4" />
          Add subject
        </Button>
      </AdminToolbar>

      <AdminTable columns={["Name", "Description", "Status", "Order", "Actions"]}>
        {subjects.length === 0 ? (
          <TableBody>
            <AdminTableRowEmpty colSpan={5} message="No subjects have been configured yet." />
          </TableBody>
        ) : (
          <TableBody>
            {subjects.map((subject: any) => (
              <TableRow key={subject.id || subject._id} className="border-white/10 hover:bg-white/5">
                <TableCell className="px-4 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <span className="size-3 rounded-full" style={{ backgroundColor: subject.color || "#22d3ee" }} />
                    {subject.name}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{subject.description || "No description"}</TableCell>
                <TableCell className="px-4 py-4"><AdminPill tone={subject.active ? "success" : "danger"}>{subject.active ? "Active" : "Inactive"}</AdminPill></TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{subject.order || 0}</TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" onClick={() => openEdit(subject)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => remove(subject.id || subject._id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </AdminTable>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-white/10 bg-slate-950 text-slate-50 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? "Edit subject" : "Add subject"}</DialogTitle>
            <DialogDescription className="text-slate-400">Manage the subject catalog used throughout the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Subject name" className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" />
            <Input value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} placeholder="Description" className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" />
            <Input value={form.color} onChange={(e) => setForm((current) => ({ ...current, color: e.target.value }))} placeholder="#3b82f6" className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" />
            <Input type="number" value={form.order} onChange={(e) => setForm((current) => ({ ...current, order: Number(e.target.value) }))} placeholder="Order" className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" />
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <span>Active</span>
              <Switch checked={form.active} onCheckedChange={(checked) => setForm((current) => ({ ...current, active: checked }))} />
            </div>
            <Button onClick={save} className="w-full bg-white text-slate-950 hover:bg-blue-100">Save subject</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
