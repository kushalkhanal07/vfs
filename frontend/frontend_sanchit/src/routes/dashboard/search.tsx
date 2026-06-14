import { createFileRoute } from "@tanstack/react-router";
import { DashboardSearchPage } from "@/dashboard/pages/DashboardSearchPage";

export const Route = createFileRoute("/dashboard/search")({
  component: DashboardSearchPage,
});
