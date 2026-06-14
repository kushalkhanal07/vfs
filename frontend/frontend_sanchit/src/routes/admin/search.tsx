import { createFileRoute } from "@tanstack/react-router";
import { AdminSearchAnalyticsPage } from "@/admin/pages/AdminSearchAnalyticsPage";

export const Route = createFileRoute("/admin/search")({
  component: AdminSearchAnalyticsPage,
});
