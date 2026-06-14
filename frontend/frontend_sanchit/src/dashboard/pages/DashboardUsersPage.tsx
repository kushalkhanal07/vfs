import { Mail, MoreVertical, ShieldCheck, UserPlus, Users } from "lucide-react";

const users = [
  { name: "Aarav Sharma", email: "aarav@student.edu", role: "Admin", status: "Active" },
  { name: "Aanya Mehta", email: "aanya@student.edu", role: "Editor", status: "Active" },
  { name: "Rohan Gupta", email: "rohan@student.edu", role: "Viewer", status: "Pending" },
  { name: "Maya Iyer", email: "maya@student.edu", role: "Editor", status: "Active" },
];

export function DashboardUsersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage team members and workspace permissions.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 self-start rounded-xl bg-black px-3.5 py-2 text-sm font-medium text-white md:self-auto">
          <UserPlus className="size-4" />
          Invite user
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-none">
          <div className="mb-2 inline-flex rounded-lg bg-gray-100 p-2 text-black">
            <Users className="size-4" />
          </div>
          <p className="text-xs text-gray-500">Total Users</p>
          <p className="text-2xl font-semibold">24</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-none">
          <div className="mb-2 inline-flex rounded-lg bg-gray-100 p-2 text-black">
            <ShieldCheck className="size-4" />
          </div>
          <p className="text-xs text-gray-500">Active This Week</p>
          <p className="text-2xl font-semibold">18</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-none">
          <div className="mb-2 inline-flex rounded-lg bg-gray-100 p-2 text-black">
            <Mail className="size-4" />
          </div>
          <p className="text-xs text-gray-500">Pending Invites</p>
          <p className="text-2xl font-semibold">6</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-none">
        <div className="hidden grid-cols-[2fr_2fr_1fr_1fr_auto] border-b border-gray-200 px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 md:grid">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        <div className="divide-y divide-border">
          {users.map((user) => (
            <div
              key={user.email}
              className="grid gap-2 px-4 py-3 md:grid-cols-[2fr_2fr_1fr_1fr_auto] md:items-center"
            >
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-sm text-gray-500">{user.email}</span>
              <span className="text-sm">{user.role}</span>
              <span className="text-xs font-semibold text-black">
                {user.status}
              </span>
              <button className="justify-self-end rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black">
                <MoreVertical className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
