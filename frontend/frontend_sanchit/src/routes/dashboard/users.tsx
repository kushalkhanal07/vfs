import { createFileRoute } from "@tanstack/react-router";
import { DashboardUsersPage } from "@/dashboard/pages/DashboardUsersPage";

export const Route = createFileRoute("/dashboard/users")({
  component: DashboardUsersPage,
});
