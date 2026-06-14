import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Sanchit" },
      { name: "description", content: "Sign in to your Sanchit learning vault." },
    ],
  }),
  component: () => <AuthShell mode="login" />,
});
