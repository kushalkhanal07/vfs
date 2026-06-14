import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  FolderTree,
  CalendarClock,
  BarChart3,
  Sparkles,
  Cloud,
  ArrowUpRight,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeading, CTASection } from "@/components/marketing";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Modules — Sanchit" },
      {
        name: "description",
        content:
          "Discover Sanchit modules: notes, file organization, revision planner, analytics, recommendations, and secure cloud storage.",
      },
      { property: "og:title", content: "Modules — Sanchit" },
      { property: "og:description", content: "Every module of the Sanchit platform." },
    ],
  }),
  component: ServicesPage,
});

const modules = [
  {
    icon: FileText,
    title: "Notes Management",
    desc: "Rich notes with markdown, snippets, and inline references — built to be searched and revised.",
  },
  {
    icon: FolderTree,
    title: "File Organization",
    desc: "Smart vaults, auto-tagging, and intelligent grouping — no rigid folders required.",
  },
  {
    icon: CalendarClock,
    title: "Revision Planner",
    desc: "A daily plan that adapts to your schedule, mastery, and upcoming exams automatically.",
  },
  {
    icon: BarChart3,
    title: "Learning Analytics",
    desc: "Visual mastery curves, streaks, and weak-spot detection to guide your next session.",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    desc: "Get suggested notes, related concepts, and the next best topic to study right now.",
  },
  {
    icon: Cloud,
    title: "Secure Cloud Storage",
    desc: "Encrypted at rest and in transit. Your vault syncs across every device — privately.",
  },
];

function ServicesPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Modules"
          title={
            <>
              One platform. <span className="text-gradient">Six powerful modules.</span>
            </>
          }
          description="Each module is designed to work beautifully on its own — and even better together."
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div
              key={m.title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-2 hover:shadow-elevated"
            >
              <div
                aria-hidden
                className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity group-hover:opacity-25"
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <m.icon className="h-7 w-7" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Included on every plan
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}
