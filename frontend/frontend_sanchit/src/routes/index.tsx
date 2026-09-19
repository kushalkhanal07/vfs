import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Search,
  Shield,
  FolderTree,
  Layers,
  BarChart3,
  Sparkles,
  Star,
  Quote,
  Plus,
  Minus,
} from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeading, FeatureCard, CTASection } from "@/components/marketing";
import { DashboardMock } from "@/components/dashboard-mock";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyVault — A Vault for Learning" },
      {
        name: "description",
        content:
          "Smart academic vault and productivity platform for students. Spaced repetition, AI-grade search, intelligent file organization.",
      },
      { property: "og:title", content: "StudyVault — A Vault for Learning" },
      { property: "og:description", content: "The next-generation student productivity platform." },
    ],
  }),
  component: HomePage,
});

const features = [
  {
    icon: FolderTree,
    title: "Smart File Storage",
    description:
      "A virtual file system that auto-organizes notes, PDFs, and snippets into intelligent collections.",
  },
  {
    icon: Shield,
    title: "Spam Detection",
    description:
      "Filters noise and duplicates automatically so your vault stays clean, focused, and high signal.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "AI-grade semantic search finds the answer — not just the file. Search by meaning, not keywords.",
  },
  {
    icon: Brain,
    title: "Spaced Repetition",
    description:
      "A proven algorithm schedules reviews at the perfect moment so concepts move into long-term memory.",
  },
  {
    icon: Layers,
    title: "Priority-Based Revision",
    description:
      "StudyVault ranks what matters most before exams using mastery, recency, and weightage signals.",
  },
  {
    icon: BarChart3,
    title: "Revision Analytics",
    description:
      "Visual dashboards show streaks, mastery curves, and where to invest your next study hour.",
  },
];

const steps = [
  {
    n: "01",
    title: "Upload your material",
    desc: "Drop notes, PDFs, slides, and links. StudyVault indexes and tags everything in seconds.",
  },
  {
    n: "02",
    title: "Let the algorithm plan",
    desc: "Spaced repetition + priority scoring builds a personal revision schedule that adapts daily.",
  },
  {
    n: "03",
    title: "Review and master",
    desc: "Short, focused sessions guided by analytics — so nothing important slips before exams.",
  },
];

const stats = [
  { value: "12k+", label: "Active students" },
  { value: "2.4M", label: "Notes organized" },
  { value: "87%", label: "Avg. mastery gain" },
  { value: "42d", label: "Median streak" },
];

const testimonials = [
  {
    name: "Aanya Sharma",
    role: "Pre-med · Year 3",
    body: "I went from drowning in PDFs to a calm, scheduled revision plan. My recall before exams is night and day.",
  },
  {
    name: "Rohit Verma",
    role: "CS · Year 2",
    body: "The smart search alone is worth it. I ask questions in plain English and StudyVault pulls the exact note.",
  },
  {
    name: "Maya Iyer",
    role: "Law · Final year",
    body: "Priority-based revision is genius. I stop wasting hours on stuff I already know.",
  },
];

const faqs = [
  {
    q: "What is StudyVault?",
    a: "StudyVault is a smart academic vault that combines storage, semantic search, spam filtering, and spaced repetition to help students learn deeply and revise efficiently.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Files are encrypted in transit and at rest, and you control sharing and access at the folder and file level.",
  },
  {
    q: "Does it work for any subject?",
    a: "StudyVault is subject-agnostic. From medicine to law to engineering — anything that needs notes, files, and revision works beautifully.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — generous free tier with smart storage, search, and basic revision. Upgrade anytime for advanced analytics and unlimited vaults.",
  },
];

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="grid-bg absolute inset-0 -z-10 opacity-40" />
        <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Now in early access · Built for ambitious students
            </span>
            <h1 className="animate-fade-in-up delay-100 mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Your second brain for <span className="text-gradient">academic mastery</span>
            </h1>
            <p className="animate-fade-in-up delay-200 mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              StudyVault is a vault for learning — smart storage, AI-grade search, and spaced
              repetition that turns scattered notes into long-term knowledge.
            </p>
            <div className="animate-fade-in-up delay-300 mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-95"
                >
                  Start your vault free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline" className="rounded-md">
                  See how it works
                </Button>
              </Link>
            </div>
            <div className="animate-fade-in-up delay-500 mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-background bg-gradient-brand"
                    style={{ opacity: 1 - i * 0.15 }}
                  />
                ))}
              </div>
              Loved by 12,000+ students worldwide
            </div>
          </div>

          <div className="animate-fade-in-up delay-500 mt-16">
            <DashboardMock />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-8 shadow-card md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-bold sm:text-4xl text-gradient">
                {s.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Everything you need to <span className="text-gradient">study smarter</span>
            </>
          }
          description="A complete toolkit that compounds your effort — built around how you actually learn."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="How it works" title="Three steps from chaos to clarity" />
        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            aria-hidden
            className="absolute left-[10%] right-[10%] top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand font-display text-lg font-bold text-primary-foreground shadow-glow">
                {s.n}
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Loved by students" title="Real students. Real momentum." />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <Quote className="h-6 w-6 text-primary/40" />
              <p className="mt-3 text-sm leading-relaxed">{t.body}</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">
                  {t.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-0.5 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <FAQItem key={i} {...f} />
          ))}
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card shadow-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium">{q}</span>
        {open ? (
          <Minus className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Plus className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground animate-fade-in-up">
          {a}
        </div>
      )}
    </div>
  );
}
