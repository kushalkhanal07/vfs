import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { deleteAdminFile, getAdminFiles, getAdminStorage } from "@/api/admin";
import { AdminPill, AdminSearchBar, AdminStateCard, AdminTable, AdminTableRowEmpty, AdminToolbar, LoadingState, formatBytes } from "@/admin/components/AdminWidgets";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const fileTypes = ["All", ".pdf", ".docx", ".pptx", ".png", ".jpg", ".jpeg", ".txt"];

export function AdminFilesPage() {
  const [data, setData] = useState<any>(null);
  const [storage, setStorage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [page, setPage] = useState(1);
  const [mutating, setMutating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [files, storageInfo] = await Promise.all([
        getAdminFiles({ search, type: type === "All" ? undefined : type, page, limit: 10 }),
        getAdminStorage(),
      ]);
      setData(files);
      setStorage(storageInfo);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, type]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => window.clearTimeout(handle);
  }, [search]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this file and remove it from storage?");
    if (!confirmed) return;

    setMutating(true);
    try {
      await deleteAdminFile(id);
      toast.success("File deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete file");
    } finally {
      setMutating(false);
    }
  };

  const files = data?.files || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  if (loading && files.length === 0) {
    return <LoadingState label="Loading files..." />;
  }

  return (
    <div className="space-y-6">
      <AdminToolbar title="Files & Storage" description="Monitor uploaded content, storage usage, and file hygiene.">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px] border-white/10 bg-white/5 text-slate-100">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {fileTypes.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminToolbar>

      <AdminSearchBar value={search} onChange={setSearch} placeholder="Search files, extensions, or owners" />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Storage used</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatBytes(storage?.summary?.totalStorageUsed || 0)}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Storage limit</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatBytes(storage?.summary?.totalStorageLimit || 0)}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Used capacity</p>
          <p className="mt-2 text-3xl font-semibold text-white">{storage?.summary?.totalStoragePercent || 0}%</p>
        </div>
      </div>

      <AdminTable columns={["File", "Owner", "Type", "Size", "Upload Date", "Access", "Actions"]}>
        {files.length === 0 ? (
          <TableBody>
            <AdminTableRowEmpty colSpan={7} message="No files found for the current filters." />
          </TableBody>
        ) : (
          <TableBody>
            {files.map((file: any) => (
              <TableRow key={file.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="px-4 py-4">
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-xs text-slate-400">{file.fileHash ? `Hash ${String(file.fileHash).slice(0, 8)}` : file.mimeType || "File"}</p>
                </TableCell>
                <TableCell className="px-4 py-4 text-slate-300">
                  <div>
                    <p>{file.ownerName || "Unknown"}</p>
                    <p className="text-xs text-slate-500">{file.ownerEmail || ""}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4"><AdminPill>{file.extension || "unknown"}</AdminPill></TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{formatBytes(file.size || 0)}</TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{new Date(file.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{file.accessCount || 0}</TableCell>
                <TableCell className="px-4 py-4">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(file.id)} disabled={mutating}>
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </AdminTable>

      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-xl">
        <p>
          Showing page {pagination.page} of {pagination.totalPages} • {pagination.total} files
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))} className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)} className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
