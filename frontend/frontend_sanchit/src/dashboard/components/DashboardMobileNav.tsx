import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Settings, Users } from "lucide-react";
import { appRoutes } from "@/shared/routes";

const items = [
  { url: appRoutes.dashboard, icon: LayoutDashboard, label: "Home" },
  { url: appRoutes.dashboardUsers, icon: Users, label: "Users" },
  { url: appRoutes.dashboardSettings, icon: Settings, label: "Settings" },
];

export function DashboardMobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 flex justify-between rounded-2xl border border-blue-200 bg-white px-2 py-2 md:hidden shadow-sm">
      {items.map((item) => {
        const active = pathname === item.url;

        return (
          <Link
            key={item.url}
            to={item.url}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
              active ? "bg-blue-100 text-blue-900" : "text-blue-400"
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
