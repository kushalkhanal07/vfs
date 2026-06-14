import { createFileRoute } from "@tanstack/react-router";
import { AdminSubjectsPage } from "@/admin/pages/AdminSubjectsPage";

export const Route = createFileRoute("/admin/subjects")({
  component: AdminSubjectsPage,
});
