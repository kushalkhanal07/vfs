import { createFileRoute } from "@tanstack/react-router";
import { AdminNotificationsPage } from "@/admin/pages/AdminNotificationsPage";

export const Route = createFileRoute("/admin/notifications")({
  component: AdminNotificationsPage,
});
