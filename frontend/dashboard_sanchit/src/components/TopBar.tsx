import { Bell, Search, Plus } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

const titleMap: Record<string, string> = {
  "/": "Dashboard",
  "/vault": "Vault",
  "/notes": "Notes",
  "/search": "Smart Search",
  "/revision": "Revision Planner",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titleMap[pathname] ?? "StudyVault";

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-border">
      <div className="flex h-16 items-center gap-4 px-4 md:px-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-semibold tracking-tight truncate">{title}</h2>
          <p className="text-xs text-muted-foreground hidden md:block">
            Welcome back, Aarav — let's keep the streak alive.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 rounded-xl bg-muted/60 border border-border px-3 py-2 w-72">
          <Search className="size-4 text-muted-foreground" />
          <input
            placeholder="Search vault, notes, topics…"
            className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>

        <Link
          to="/notifications"
          className="relative rounded-xl p-2.5 hover:bg-muted transition-colors"
        >
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary animate-pulse" />
        </Link>

        <button className="hidden sm:inline-flex items-center gap-1.5 rounded-xl gradient-primary text-primary-foreground px-3.5 py-2 text-sm font-medium shadow-soft hover:shadow-elegant transition-shadow">
          <Plus className="size-4" />
          New
        </button>

        <div className="size-9 rounded-full gradient-cool grid place-items-center text-white text-sm font-semibold shadow-soft">
          A
        </div>
      </div>
    </header>
  );
}
