import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Settings, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { appRoutes } from "@/shared/routes";
import { getCurrentUser, type CurrentUser } from "@/api/user";

type NavItem = {
  url: string;
  icon: typeof LayoutDashboard;
  label: string;
  /** Hidden from members whose role is a plain "User". */
  adminOnly?: boolean;
};

const items: NavItem[] = [
  { url: appRoutes.dashboard, icon: LayoutDashboard, label: "Home" },
  { url: appRoutes.dashboardUsers, icon: Users, label: "Users", adminOnly: true },
  { url: appRoutes.dashboardSettings, icon: Settings, label: "Settings" },
];

export function DashboardMobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRole = async () => {
      try {
        const current: CurrentUser = await getCurrentUser();
        if (isMounted) setRole(current.role ?? null);
      } catch {
        if (isMounted) setRole(null);
      }
    };

    fetchRole();
    window.addEventListener("user:refresh", fetchRole);
    return () => {
      isMounted = false;
      window.removeEventListener("user:refresh", fetchRole);
    };
  }, []);

  const isPlainUser = (role ?? "User") === "User";
  const visibleItems = items.filter((item) => !(item.adminOnly && isPlainUser));

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 flex justify-between rounded-2xl border border-blue-200 bg-white px-2 py-2 md:hidden shadow-sm">
      {visibleItems.map((item) => {
        const active = pathname === item.url;

        return (
          <Link
            key={item.url}
            to={item.url}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
              active ? "bg-blue-100 text-blue-900" : "text-blue-600/70"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
