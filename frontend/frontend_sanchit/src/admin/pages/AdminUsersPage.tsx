import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Ban, Eye, Filter, Search, Trash2, UserCheck, UserCog, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { getAdminUser, getAdminUsers, updateAdminUserRole, updateAdminUserStatus, deleteAdminUser } from "@/api/admin";
import { AdminPill, AdminSearchBar, AdminStateCard, AdminTable, AdminTableRowEmpty, AdminToolbar, LoadingState, formatBytes } from "@/admin/components/AdminWidgets";
import { ErrorBoundary } from "@/admin/components/ErrorBoundary";

const statusOptions = ["All", "Active", "Suspended"];
const roleOptions = ["All", "Super Admin", "Manager", "User"];

function normalizeRoleForUi(role: string | undefined | null) {
  if (!role) return "User";
  return role === "Admin" ? "Super Admin" : role;
}

function normalizeRoleForApi(role: string | undefined) {
  if (!role) return role;
  return role === "Super Admin" ? "Admin" : role;
}

export function AdminUsersPage() {
  const [usersData, setUsersData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [role, setRole] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAdminUsers({
        search,
        status: status === "All" ? undefined : status,
        role: role === "All" ? undefined : normalizeRoleForApi(role),
        page,
        limit: 10,
        sort: "-createdAt",
      });
      setUsersData(result);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, status, role]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPage(1);
      loadUsers();
    }, 350);

    return () => window.clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedUserId) {
        setSelectedUser(null);
        return;
      }

      setDetailLoading(true);
      try {
        const detail = await getAdminUser(selectedUserId);
        setSelectedUser(detail);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load user profile");
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  }, [selectedUserId]);

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || { page: 1, totalPages: 1, total: 0 };

  const handleStatus = async (userId: string, nextStatus: string) => {
    setMutating(true);
    try {
      await updateAdminUserStatus(userId, nextStatus);
      toast.success(`User ${nextStatus === "Suspended" ? "blocked" : "unblocked"}`);
      await loadUsers();
      if (selectedUserId === userId) {
        setSelectedUserId(userId);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setMutating(false);
    }
  };

  const handleRole = async (userId: string, nextRole: string) => {
    setMutating(true);
    try {
      await updateAdminUserRole(userId, normalizeRoleForApi(nextRole) || nextRole);
      toast.success("User role updated");
      await loadUsers();
      if (selectedUserId === userId) {
        setSelectedUserId(userId);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async (userId: string) => {
    const confirmDelete = window.confirm("Delete this user and their content?");
    if (!confirmDelete) return;

    setMutating(true);
    try {
      await deleteAdminUser(userId);
      toast.success("User deleted");
      if (selectedUserId === userId) {
        setSelectedUserId(null);
      }
      await loadUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setMutating(false);
    }
  };

  const tableRows = useMemo(
    () =>
      users.map((user: any) => ({
        ...user,
        statusTone: user.status === "Active" ? "success" : "danger",
      })),
    [users],
  );

  if (loading && users.length === 0) {
    return <LoadingState label="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      <AdminToolbar title="User Management" description="Search, review, and manage student access across the platform.">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40 border-white/10 bg-white/5 text-slate-100">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-45 border-white/10 bg-white/5 text-slate-100">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AdminToolbar>

      <AdminSearchBar value={search} onChange={setSearch} placeholder="Search users by name or email" />

      <AdminTable columns={["Name", "Email", "Role", "Status", "Files", "Notes", "Revisions", "Joined", "Actions"]}>
        {tableRows.length === 0 ? (
          <AdminTableRowEmpty colSpan={9} message="No users match the current filters." />
        ) : (
          <>
            {tableRows.map((user: any) => (
              <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                <TableCell className="px-4 py-4">
                  <button className="flex items-center gap-3 text-left" onClick={() => setSelectedUserId(user.id)}>
                    <div className="grid size-10 place-items-center rounded-2xl bg-blue-500/15 font-semibold text-blue-100">
                      {(user.name || "A").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.isLoggedIn ? "Online now" : "Offline"}</p>
                    </div>
                  </button>
                </TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{user.email}</TableCell>
                <TableCell className="px-4 py-4">
                  <Select value={normalizeRoleForUi(user.role)} onValueChange={(nextRole) => handleRole(user.id, nextRole)} disabled={mutating}>
                    <SelectTrigger className="w-37.5 border-white/10 bg-white/5 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.filter((item) => item !== "All").map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="px-4 py-4">
                  <AdminPill tone={user.status === "Active" ? "success" : "danger"}>{user.status}</AdminPill>
                </TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{user.filesCount}</TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{user.notesCount}</TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{user.revisionCount}</TableCell>
                <TableCell className="px-4 py-4 text-slate-300">{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" onClick={() => setSelectedUserId(user.id)}>
                      <Eye className="mr-2 size-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                      onClick={() => handleStatus(user.id, user.status === "Active" ? "Suspended" : "Active")}
                      disabled={mutating}
                    >
                      {user.status === "Active" ? <UserX className="mr-2 size-4" /> : <UserCheck className="mr-2 size-4" />}
                      {user.status === "Active" ? "Block" : "Unblock"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)} disabled={mutating}>
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </>
        )}
      </AdminTable>

      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-xl">
        <p>
          Showing page {pagination.page} of {pagination.totalPages} • {pagination.total} users
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

      <Dialog open={Boolean(selectedUserId)} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-slate-950 text-slate-50 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">User profile</DialogTitle>
            <DialogDescription className="text-slate-400">Detailed profile, storage, and recent activity.</DialogDescription>
          </DialogHeader>

          {detailLoading || !selectedUser ? (
            <LoadingState label="Loading user profile..." />
          ) : (
            <ErrorBoundary>
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-blue-200/70">{normalizeRoleForUi(selectedUser?.user?.role) || "-"}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{selectedUser?.user?.name ?? "Unknown"}</h3>
                    <p className="text-sm text-slate-400">{selectedUser?.user?.email ?? ""}</p>
                  </div>
                  <div className="grid gap-2 text-right text-sm text-slate-300">
                    <span>Joined {selectedUser?.user?.joinedAt ? new Date(selectedUser.user.joinedAt).toLocaleDateString() : "-"}</span>
                    <span>Storage {formatBytes(selectedUser?.user?.storageUsed ?? 0)} / {formatBytes(selectedUser?.user?.storageLimit ?? 0)}</span>
                    <span>{selectedUser?.user?.storagePercent ?? 0}% used</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <AdminPill tone={selectedUser?.user?.status === "Active" ? "success" : "danger"}>{selectedUser?.user?.status ?? "-"}</AdminPill>
                  <AdminPill>{selectedUser?.analytics?.noteCount ?? 0} notes</AdminPill>
                  <AdminPill>{selectedUser?.analytics?.fileCount ?? 0} files</AdminPill>
                  <AdminPill>{selectedUser?.analytics?.revisionCount ?? 0} revisions</AdminPill>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Notes", value: selectedUser.analytics.noteCount },
                  { label: "Files", value: selectedUser.analytics.fileCount },
                  { label: "Revisions", value: selectedUser.analytics.revisionCount },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <AdminSectionCard title="Recent activity" description="Latest actions taken by the user.">
                  <div className="space-y-3">
                      {(selectedUser?.analytics?.recentActivity ?? []).slice(0, 5).map((activity: any, index: number) => (
                        <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                          <p className="font-medium text-white">{activity?.activityType ?? "-"}</p>
                          <p className="text-xs text-slate-400">{activity?.createdAt ? new Date(activity.createdAt).toLocaleString() : ""}</p>
                        </div>
                      ))}
                    </div>
                </AdminSectionCard>
                <AdminSectionCard title="Search history" description="Recent smart search activity.">
                  <div className="space-y-3">
                    {(selectedUser?.analytics?.recentSearches ?? []).slice(0, 5).map((searchItem: any, index: number) => (
                      <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                        <p className="font-medium text-white">{searchItem?.query ?? "-"}</p>
                        <p className="text-xs text-slate-400">{searchItem?.resultsCount ?? 0} results • {searchItem?.createdAt ? new Date(searchItem.createdAt).toLocaleString() : ""}</p>
                      </div>
                    ))}
                  </div>
                </AdminSectionCard>
              </div>

              <AdminSectionCard title="Subject mastery" description="User-level learning performance by subject.">
                <div className="grid gap-3 md:grid-cols-2">
                  {(selectedUser?.analytics?.subjectMastery?.length ?? 0) ? (
                    (selectedUser?.analytics?.subjectMastery ?? []).map((subject: any, index: number) => (
                      <div key={subject.subject || index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-4 text-sm text-slate-200">
                          <span>{subject.subject}</span>
                          <span>{subject.mastery}%</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-linear-to-r from-blue-400 to-emerald-400" style={{ width: `${subject.mastery}%` }} />
                              </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400">No subject mastery data yet.</div>
                  )}
                </div>
              </AdminSectionCard>
            </div>
            </ErrorBoundary>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
