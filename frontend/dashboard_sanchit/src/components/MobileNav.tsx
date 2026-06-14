import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FolderOpen, StickyNote, Search, CalendarClock } from "lucide-react";

const items = [
  { url: "/", icon: LayoutDashboard, label: "Home" },
  { url: "/vault", icon: FolderOpen, label: "Vault" },
  { url: "/notes", icon: StickyNote, label: "Notes" },
  { url: "/search", icon: Search, label: "Search" },
  { url: "/revision", icon: CalendarClock, label: "Revise" },
];

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-40 glass-strong rounded-2xl shadow-elegant px-2 py-2 flex justify-between">
      {items.map((i) => {
        const active = pathname === i.url;
        return (
          <Link
            key={i.url}
            to={i.url}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] font-medium transition-colors ${
              active ? "bg-primary/10 text-primary" : "text-muted-foreground"
            }`}
          >
            <i.icon className="size-4" />
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
