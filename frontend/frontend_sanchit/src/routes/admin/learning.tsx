import { createFileRoute } from "@tanstack/react-router";
import { AdminLearningAnalyticsPage } from "@/admin/pages/AdminLearningAnalyticsPage";

export const Route = createFileRoute("/admin/learning")({
  component: AdminLearningAnalyticsPage,
});
