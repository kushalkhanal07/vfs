import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — StudyVault" },
      { name: "description", content: "Sign in to your StudyVault learning vault." },
    ],
  }),
  component: () => <AuthShell mode="login" />,
});
