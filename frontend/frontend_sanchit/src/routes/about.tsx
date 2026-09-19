import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Lightbulb, Brain, Users, Rocket, Heart, BookOpen } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeading, FeatureCard, CTASection } from "@/components/marketing";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — StudyVault" },
      {
        name: "description",
        content:
          "StudyVault's mission: help every student think clearly, retain deeply, and revise smartly with an intelligent learning vault.",
      },
      { property: "og:title", content: "About StudyVault" },
      { property: "og:description", content: "The vision and team behind a vault for learning." },
    ],
  }),
  component: AboutPage,
});

const timeline = [
  {
    year: "2023",
    title: "The spark",
    desc: "A frustrated cohort of students drowning in PDFs sketched a smarter vault on a whiteboard.",
  },
  {
    year: "2024",
    title: "First algorithm",
    desc: "Spaced repetition + priority scoring built and tested with 200 early students.",
  },
  {
    year: "2025",
    title: "Public beta",
    desc: "Smart search, spam filter, and analytics ship. 12k+ students join the waitlist.",
  },
  {
    year: "2026",
    title: "What's next",
    desc: "Collaborative vaults, mobile capture, and adaptive question generation.",
  },
];

const team = [
  {
    name: "StudyVault Team",
    role: "Founders & engineers",
    bio: "Ex-students, lifelong learners, building the tool we always wanted.",
  },
  {
    name: "Learning Science",
    role: "Research advisors",
    bio: "Cognitive scientists shaping the spacing & retrieval algorithms.",
  },
  {
    name: "Student Council",
    role: "Beta community",
    bio: "12k+ students testing, breaking, and improving StudyVault every week.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-primary" /> Our story
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold sm:text-6xl">
            We believe students deserve <span className="text-gradient">better tools</span> for the
            way they actually learn.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            StudyVault was born inside a library at 2 AM — surrounded by a hundred tabs, scattered
            PDFs, and a calendar full of exams. We built the vault we wished existed.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-2 lg:px-8">
        {[
          {
            icon: Target,
            title: "Our mission",
            description:
              "Make deep, durable learning the default for every student — not a luxury reserved for the few who already know how to study.",
          },
          {
            icon: Lightbulb,
            title: "Our vision",
            description:
              "A world where every learner has a personal, intelligent vault that grows with them through school, university, and life.",
          },
        ].map((c) => (
          <FeatureCard key={c.title} {...c} />
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The problem"
          title="Notes everywhere. Knowledge nowhere."
          description="Students juggle Drive, WhatsApp, screenshots, PDFs, and printouts. The information exists — but recall, structure, and timing fall apart right before exams."
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Our approach" title="Intelligent learning, by design" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Brain,
              title: "Cognitive science first",
              description: "Spacing, retrieval, and interleaving baked into every interaction.",
            },
            {
              icon: BookOpen,
              title: "Structure that emerges",
              description: "Auto-tagging and smart collections so your vault organizes itself.",
            },
            {
              icon: Rocket,
              title: "Compounds over time",
              description: "The longer you use StudyVault, the smarter your study schedule becomes.",
            },
          ].map((c) => (
            <FeatureCard key={c.title} {...c} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Journey" title="From whiteboard to vault" />
        <div className="relative mt-12">
          <div aria-hidden className="absolute left-3 top-0 bottom-0 w-px bg-border md:left-1/2" />
          <div className="space-y-10">
            {timeline.map((t, i) => (
              <div
                key={t.year}
                className={`relative grid gap-4 md:grid-cols-2 md:gap-10 ${i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}
              >
                <div
                  className={`pl-10 md:pl-0 ${i % 2 === 0 ? "md:text-right md:pr-10" : "md:pl-10"}`}
                >
                  <div className="text-sm font-semibold text-primary">{t.year}</div>
                  <h3 className="mt-1 font-display text-xl font-bold">{t.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                </div>
                <div
                  aria-hidden
                  className="absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-background bg-gradient-brand md:left-1/2 md:-translate-x-1/2"
                >
                  <span className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="People" title="Built by learners, for learners" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {team.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{t.name}</h3>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{t.role}</div>
              <p className="mt-3 text-sm text-muted-foreground">{t.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}
