import { createFileRoute } from "@tanstack/react-router";
import { AdminLogsPage } from "@/admin/pages/AdminLogsPage";

export const Route = createFileRoute("/admin/logs")({
  component: AdminLogsPage,
});
