import { createFileRoute } from "@tanstack/react-router";
import { DashboardHomePage } from "@/dashboard/pages/DashboardHomePage";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHomePage,
});
