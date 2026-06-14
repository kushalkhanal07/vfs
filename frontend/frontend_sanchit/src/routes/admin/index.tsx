import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardPage } from "@/admin/pages/AdminDashboardPage";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});
