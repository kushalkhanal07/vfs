import { createFileRoute } from "@tanstack/react-router";
import { AdminRevisionAnalyticsPage } from "@/admin/pages/AdminRevisionAnalyticsPage";

export const Route = createFileRoute("/admin/revisions")({
  component: AdminRevisionAnalyticsPage,
});
