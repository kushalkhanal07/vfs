import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — StudyVault" },
      {
        name: "description",
        content: "Create your free StudyVault account and build a smarter learning vault.",
      },
    ],
  }),
  component: () => <AuthShell mode="signup" />,
});
