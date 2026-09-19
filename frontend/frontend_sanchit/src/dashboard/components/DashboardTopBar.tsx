import { Bell, Plus, Search, LogOut } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { appRoutes } from "@/shared/routes";
import { getCurrentUser, logoutUser, type CurrentUser } from "@/api/user";
import { useNotifications } from "@/contexts/notificationsContext";

const titleMap: Record<string, string> = {
  [appRoutes.dashboard]: "Dashboard",
  [appRoutes.dashboardUsers]: "Users",
  [appRoutes.dashboardSettings]: "Settings",
};

export function DashboardTopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const title = titleMap[pathname] ?? "Dashboard";
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [searchText, setSearchText] = useState("");
  const { items: notifications } = useNotifications();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const unreadNotifications = (notifications ?? []) as Array<{ isRead?: boolean }>;

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        if (isMounted) {
          setUser(data);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      }
    };

    loadUser();

    const onUserRefresh = async () => {
      try {
        const data = await getCurrentUser();
        if (isMounted) setUser(data);
      } catch {
        if (isMounted) setUser(null);
      }
    };
    window.addEventListener("user:refresh", onUserRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener("user:refresh", onUserRefresh);
    };
  }, []);

  const initial = (user?.name?.trim()?.charAt(0) || "U").toUpperCase();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // Continue with client-side cleanup even if server logout fails.
    } finally {
      localStorage.clear();
      navigate({ to: appRoutes.login });
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-blue-800 bg-blue-900 text-white">
      <div className="flex h-16 items-center gap-4 px-4 md:px-8">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold tracking-tight text-white md:text-xl">{title}</h2>
          {user ? (
            <p className="hidden text-xs text-blue-200 md:block">
              Welcome back, {user.name} ({user.email})
            </p>
          ) : (
            <p className="hidden text-xs text-blue-200 md:block">
              Welcome back. You are in the integrated dashboard module.
            </p>
          )}
        </div>

        <div className="hidden w-72 items-center gap-2 rounded-xl border border-blue-800 bg-blue-950/60 px-3 py-2 transition-colors focus-within:border-blue-500 md:flex">
          <Search className="size-4 text-blue-300" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate({ to: appRoutes.smartSearch, search: `?q=${encodeURIComponent(searchText)}` });
              }
            }}
            placeholder="Search workspace..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-blue-300/70"
          />
        </div>

        <Link
          to={appRoutes.notification}
          className="relative rounded-xl p-2.5 transition-colors hover:bg-blue-800"
        >
          <Bell className="size-4 text-white" />
          {unreadNotifications.filter((notification) => !notification.isRead).length > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4.5 place-items-center rounded-full bg-destructive px-1 text-[11px] text-white">
              {unreadNotifications.filter((notification) => !notification.isRead).length > 9
                ? "9+"
                : unreadNotifications.filter((notification) => !notification.isRead).length}
            </span>
          )}
        </Link>

        <button className="hidden items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-soft transition-colors hover:bg-blue-500 sm:inline-flex">
          <Plus className="size-4" />
          New
        </button>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
        >
          <LogOut className="size-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>

        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden min-w-0 text-right md:block">
              <p className="truncate text-xs font-medium text-white">{user.name}</p>
              <p className="truncate text-[11px] text-blue-300">{user.role}</p>
            </div>
          )}
          <div
            className="grid size-9 place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white"
            title={user?.name || "User"}
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
