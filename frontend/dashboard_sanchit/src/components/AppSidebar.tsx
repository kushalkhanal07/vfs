import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderOpen,
  StickyNote,
  Search,
  CalendarClock,
  Bell,
  Settings,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogoTile } from "@/components/brand-logo";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Vault", url: "/vault", icon: FolderOpen },
  { title: "Notes", url: "/notes", icon: StickyNote },
  { title: "Smart Search", url: "/search", icon: Search },
  { title: "Revision", url: "/revision", icon: CalendarClock },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const bottomItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col glass-strong border-r border-sidebar-border h-screen sticky top-0">
      <div className="px-5 py-6 flex items-center gap-3">
        <BrandLogoTile className="size-10 rounded-xl shadow-glow" />
        <div>
          <h1 className="font-semibold tracking-tight text-base leading-none">StudyVault</h1>
          <p className="text-[11px] text-muted-foreground mt-1">Vault for Learning</p>
        </div>
      </div>

      <nav className="px-3 py-2 flex-1 space-y-1">
        <p className="px-3 pb-2 pt-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          Workspace
        </p>
        {items.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon
                className={`size-4 transition-transform group-hover:scale-110 ${
                  active ? "text-primary" : ""
                }`}
              />
              <span>{item.title}</span>
              {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <nav className="px-3 py-2 space-y-1 border-t border-sidebar-border">
        {bottomItems.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon
                className={`size-4 transition-transform group-hover:scale-110 ${
                  active ? "text-primary" : ""
                }`}
              />
              <span>{item.title}</span>
              {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-2">
        <div className="rounded-2xl p-4 gradient-primary text-primary-foreground relative overflow-hidden">
          <Sparkles className="absolute -right-2 -top-2 size-16 opacity-20" />
          <p className="text-sm font-semibold">Pro AI Tutor</p>
          <p className="text-xs opacity-90 mt-1">Ask anything from your vault.</p>
          <button className="mt-3 text-xs font-medium bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-1.5">
            Try Now
          </button>
        </div>

        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          <span>{dark ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>
    </aside>
  );
}
