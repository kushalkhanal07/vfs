import { createFileRoute } from "@tanstack/react-router";
import {
  FolderTree,
  Search,
  Shield,
  Brain,
  Layers,
  BarChart3,
  LayoutDashboard,
  Bell,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeading, CTASection } from "@/components/marketing";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Sanchit" },
      {
        name: "description",
        content:
          "Explore Sanchit's features: smart vault, AI search, spam detection, spaced repetition, priority revision, analytics, and more.",
      },
      { property: "og:title", content: "Features — Sanchit" },
      { property: "og:description", content: "A complete intelligent learning toolkit." },
    ],
  }),
  component: FeaturesPage,
});

const features = [
  {
    icon: FolderTree,
    title: "Smart Virtual File System",
    desc: "An intelligent vault that auto-tags, groups, and surfaces files into smart collections — without rigid folders.",
    points: ["Auto-tagging", "Smart collections", "Cross-linked references"],
  },
  {
    icon: Search,
    title: "AI-like Smart Search",
    desc: "Ask in natural language. Sanchit understands intent, ranks by relevance, and shows the snippet that matters.",
    points: ["Semantic search", "Intent detection", "Inline snippets"],
  },
  {
    icon: Shield,
    title: "Spam Detection System",
    desc: "Filter duplicates, low-quality scans, and noise so your vault always shows the highest signal.",
    points: ["Duplicate filter", "Quality scoring", "Auto-archive"],
  },
  {
    icon: Brain,
    title: "Spaced Repetition Algorithm",
    desc: "A research-backed scheduler that reviews concepts at the moment your brain is about to forget them.",
    points: ["Adaptive intervals", "Per-concept tracking", "Forget-curve aware"],
  },
  {
    icon: Layers,
    title: "Priority-Based Revision",
    desc: "Mastery, recency, and exam weightage combine to surface what matters most — first.",
    points: ["Weight scoring", "Exam-aware", "Smart queue"],
  },
  {
    icon: BarChart3,
    title: "Revision Analytics",
    desc: "See streaks, mastery curves, and weak spots in beautiful, actionable dashboards.",
    points: ["Mastery curves", "Heatmaps", "Weakness alerts"],
  },
  {
    icon: LayoutDashboard,
    title: "Learning Dashboard",
    desc: "One place for everything — today's reviews, recent vaults, and a daily focus card.",
    points: ["Daily focus", "Goal tracking", "Streaks"],
  },
  {
    icon: Bell,
    title: "Notifications & Reminders",
    desc: "Gentle nudges at the right time — never noisy, never missed.",
    points: ["Smart timing", "Quiet hours", "Cross-device sync"],
  },
];

function FeaturesPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Every tool a serious learner <span className="text-gradient">actually needs</span>
            </>
          }
          description="Sanchit isn't a notes app. It's a full intelligent learning system designed around how memory really works."
        />
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        {features.map((f, i) => (
          <div
            key={f.title}
            className={`group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-elevated sm:p-10`}
          >
            <div
              aria-hidden
              className={`absolute ${i % 2 === 0 ? "-right-24" : "-left-24"} -top-24 h-72 w-72 rounded-full bg-gradient-brand opacity-10 blur-3xl transition-opacity group-hover:opacity-20`}
            />
            <div
              className={`relative grid items-center gap-8 md:grid-cols-2 ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold sm:text-3xl">{f.title}</h3>
                <p className="mt-3 text-muted-foreground">{f.desc}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                  {f.points.map((p) => (
                    <li
                      key={p}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-center text-xs font-medium"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <FeatureVisual index={i} icon={f.icon} />
            </div>
          </div>
        ))}
      </section>

      <CTASection />
    </SiteLayout>
  );
}

function FeatureVisual({ index, icon: Icon }: { index: number; icon: any }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-gradient-mesh p-6">
      <div aria-hidden className="absolute inset-0 grid-bg opacity-30" />
      <div className="relative flex h-full items-center justify-center">
        <div className="grid h-28 w-28 animate-float place-items-center rounded-3xl bg-card shadow-elevated">
          <Icon className="h-12 w-12 text-primary" />
        </div>
        <div
          aria-hidden
          className="absolute left-6 top-6 h-3 w-3 rounded-full bg-cyan-accent shadow-glow"
        />
        <div
          aria-hidden
          className="absolute bottom-8 right-10 h-3 w-3 rounded-full bg-purple-accent shadow-glow"
        />
        <div aria-hidden className="absolute bottom-12 left-10 h-2 w-2 rounded-full bg-primary" />
      </div>
    </div>
  );
}
