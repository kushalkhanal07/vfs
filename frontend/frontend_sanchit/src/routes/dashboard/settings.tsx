import { createFileRoute } from "@tanstack/react-router";
import { DashboardSettingsPage } from "@/dashboard/pages/DashboardSettingsPage";

export const Route = createFileRoute("/dashboard/settings")({
  component: DashboardSettingsPage,
});
