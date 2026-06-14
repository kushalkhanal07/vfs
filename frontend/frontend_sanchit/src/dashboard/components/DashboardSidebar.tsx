import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Settings,
  Sparkles,
  GraduationCap,
  Moon,
  Sun,
  Folder,
  FileText,
  Search,
  BookOpen,
  Bell,
  HardDrive,
} from "lucide-react";
import { useEffect, useState } from "react";
import { appRoutes } from "@/shared/routes";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const items = [
  { title: "Dashboard", url: appRoutes.dashboard, icon: LayoutDashboard },
  { title: "Users", url: appRoutes.dashboardUsers, icon: Users },
  { title: "Vault", url: appRoutes.vault, icon: Folder },
  { title: "Notes", url: appRoutes.notes, icon: FileText },
  { title: "Smart Search ", url: appRoutes.smartSearch, icon: Search },
  { title: "Revision", url: appRoutes.revision, icon: BookOpen },
  { title: "Notification", url: appRoutes.notification, icon: Bell },
  { title: "Settings", url: appRoutes.dashboardSettings, icon: Settings },
];

export function DashboardSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(false);
  const [storage, setStorage] = useState<{ used: number; limit: number; percent: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);

    // Fetch storage info
    const fetchStorage = async () => {
      try {
        const response = await axios.get(`${API_BASE}/user/storage`, {
          withCredentials: true,
        });
        const usedMB = response.data.storageUsed / 1048576;
        const limitMB = response.data.storageLimit / 1048576;
        setStorage({
          used: Math.round(usedMB * 10) / 10,
          limit: Math.round(limitMB * 10) / 10,
          percent: response.data.storagePercent,
        });
      } catch (err) {
        console.error("Failed to fetch storage", err);
      }
    };

    fetchStorage();

    // Listen for storage updates
    const handleStorageUpdate = () => {
      fetchStorage();
    };
    window.addEventListener("storage-updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("storage-updated", handleStorageUpdate);
    };
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-blue-900 bg-blue-900 text-white md:sticky md:top-0 md:flex">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-900 text-white">
          <GraduationCap className="size-5" />
        </div>
        <div>
          <h1 className="text-base font-semibold leading-none tracking-tight text-white">Sanchit</h1>
          <p className="mt-1 text-[11px] text-gray-300">Unified Workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="px-3 pb-2 pt-3 text-[11px] font-medium uppercase tracking-wider text-white/80">
          Dashboard
        </p>
        {items.map((item) => {
          const active = pathname === item.url;

          return (
            <Link
              key={item.url}
              to={item.url}
              className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-white/90 hover:bg-blue-700 hover:text-white"
              }`}
            >
              <item.icon className={`size-4 transition-transform group-hover:scale-110 ${active ? "text-white" : "text-blue-300"}`} />
              <span>{item.title}</span>
              {active && <span className="ml-auto size-1.5 rounded-full bg-white/20" />}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 p-3">

        {/* Storage Indicator */}
        {storage && (
          <div className="rounded-md border border-blue-700 bg-blue-800 p-3 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-white" />
              <p className="text-xs font-medium text-white">
                {storage.used} / {storage.limit} MB
              </p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-blue-600/30">
              <div
                className={`h-full transition-all ${
                  storage.percent <= 70
                    ? "bg-blue-600"
                    : storage.percent <= 89
                    ? "bg-blue-600"
                    : "bg-blue-700"
                }`}
                style={{ width: `${Math.min(storage.percent, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-white/80">
              {storage.percent}% used
            </p>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          <span>{dark ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>
    </aside>
  );
}
