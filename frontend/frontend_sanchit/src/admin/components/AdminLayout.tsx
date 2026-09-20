import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BellRing,
  BookOpenText,
  Files,
  FileWarning,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Moon,
  Search,
  Settings2,
  ShieldCheck,
  Sun,
  Users,
  Waypoints,
} from "lucide-react";
import { appRoutes } from "@/shared/routes";
import { getCurrentUser, logoutUser, type CurrentUser } from "@/api/user";
import { BrandLogoTile } from "@/components/brand-logo";

const adminNav = [
  { title: "Dashboard", url: appRoutes.admin, icon: LayoutDashboard },
  { title: "Users", url: appRoutes.adminUsers, icon: Users },
  { title: "Learning Analytics", url: appRoutes.adminLearning, icon: BarChart3 },
  { title: "Revision Analytics", url: appRoutes.adminRevisions, icon: BookOpenText },
  { title: "Files & Storage", url: appRoutes.adminFiles, icon: Files },
  { title: "Smart Search", url: appRoutes.adminSearch, icon: Search },
  { title: "Spam Detection", url: appRoutes.adminSpam, icon: FileWarning },
  { title: "Subjects", url: appRoutes.adminSubjects, icon: Waypoints },
  { title: "Notifications", url: appRoutes.adminNotifications, icon: BellRing },
  { title: "Feedback", url: appRoutes.adminFeedback, icon: MessageSquareText },
  { title: "System Logs", url: appRoutes.adminLogs, icon: ShieldCheck },
  { title: "Settings", url: appRoutes.adminSettings, icon: Settings2 },
] as const;

export function AdminLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [dark, setDark] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
    const isDark = saved ? saved === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setDark(Boolean(isDark));
    document.documentElement.classList.toggle("dark", Boolean(isDark));
  }, []);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const current = await getCurrentUser();

        if (!active) return;

        if (current.role !== "Super Admin") {
          await navigate({ to: appRoutes.login, replace: true });
          return;
        }

        setUser(current);
      } catch {
        if (active) {
          await navigate({ to: appRoutes.login, replace: true });
        }
      } finally {
        if (active) {
          setCheckingAccess(false);
        }
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, [navigate]);

  const toggleTheme = () => {
    setDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const activeNav = useMemo(
    () => adminNav.find((item) => pathname === item.url || pathname.startsWith(`${item.url}/`)) ?? adminNav[0],
    [pathname],
  );
  const backgroundImage = dark
    ? "radial-gradient(circle_at_top, rgba(25,144,119,0.16), transparent 32%), linear-gradient(180deg, #04120f 0%, #0a1f1a 42%, #0d1f1b 100%)"
    : "radial-gradient(circle_at_top, rgba(25,144,119,0.14), transparent 34%), linear-gradient(180deg, #f0faf6 0%, #eaf2ef 52%, #d8f2e7 100%)";

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logoutUser();
    } catch {
      // Continue with client-side navigation even if the session endpoint fails.
    } finally {
      await navigate({ to: appRoutes.login, replace: true });
      setIsLoggingOut(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="size-4 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
          <span className="text-sm text-slate-600 dark:text-slate-200">Checking admin access...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-shell min-h-screen text-slate-900 dark:text-slate-50"
      style={{ backgroundImage }}
    >
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-blue-100 bg-white/80 backdrop-blur-xl lg:flex lg:flex-col dark:border-white/10 dark:bg-slate-950/70">
          <div className="flex items-center gap-3 border-b border-blue-100 px-6 py-5 dark:border-white/10">
            <BrandLogoTile className="size-11 rounded-2xl ring-1 ring-blue-400/30" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-700/70 dark:text-blue-200/70">Admin Panel</p>
              <h1 className="font-display text-lg font-semibold">StudyVault Control</h1>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {adminNav.map((item) => {
              const active = pathname === item.url || pathname.startsWith(`${item.url}/`);

              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "bg-blue-500/15 text-blue-900 shadow-[0_0_0_1px_rgba(25,144,119,0.28)] dark:text-blue-50"
                      : "text-slate-600 hover:bg-blue-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  <item.icon className={`size-4 ${active ? "text-blue-700 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3 border-t border-blue-100 p-4 dark:border-white/10">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {dark ? "Light mode" : "Dark mode"}
            </button>
            <Link
              to={appRoutes.dashboard}
              className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-50 dark:hover:bg-blue-500/15"
            >
              <LayoutDashboard className="size-4" />
              Open student app
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
            <div className="flex items-center gap-4 px-4 py-4 lg:px-6">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.3em] text-blue-700/70 dark:text-blue-200/70">{activeNav.title}</p>
                <div className="mt-1 flex items-center gap-3">
                  <h2 className="truncate font-display text-xl font-semibold text-slate-900 dark:text-white lg:text-2xl">StudyVault Admin</h2>
                  {user ? (
                    <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 sm:inline-flex dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-100">
                      {user.name}
                    </span>
                  ) : null}
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-white p-2.5 text-slate-700 transition-colors hover:bg-blue-50 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                aria-label="Toggle theme"
              >
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-blue-100 disabled:opacity-60"
              >
                <LogOut className="size-4" />
                {isLoggingOut ? "Signing out..." : "Logout"}
              </button>

              <div className="hidden items-center gap-3 rounded-2xl border border-blue-100 bg-white px-3 py-2 lg:flex dark:border-white/10 dark:bg-white/5">
                <div className="grid size-9 place-items-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-700 dark:text-blue-100">
                  {(user?.name?.charAt(0) || "A").toUpperCase()}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || "Admin"}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email || "admin@sanchit.app"}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="relative flex-1 px-4 py-6 lg:px-6 lg:py-8">
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-20 top-24 size-72 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute right-0 top-64 size-80 rounded-full bg-amber-400/10 blur-3xl" />
            </div>
            <div className="relative mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>

          <nav className="sticky bottom-0 z-30 border-t border-blue-100 bg-white/90 px-3 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 lg:hidden">
            <div className="grid grid-cols-4 gap-2">
              {adminNav.slice(0, 4).map((item) => {
                const active = pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors ${
                      active ? "bg-blue-500/15 text-blue-700 dark:text-blue-100" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <item.icon className="size-4" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
