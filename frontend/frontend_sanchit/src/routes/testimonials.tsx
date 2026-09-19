import { createFileRoute } from "@tanstack/react-router";
import { Star, Quote, TrendingUp, Clock, Award } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeading, CTASection } from "@/components/marketing";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — StudyVault" },
      {
        name: "description",
        content:
          "Real stories from students using StudyVault to study smarter, retain more, and stress less.",
      },
      { property: "og:title", content: "Student stories — StudyVault" },
      { property: "og:description", content: "Productivity wins from real learners." },
    ],
  }),
  component: TestimonialsPage,
});

const reviews = [
  {
    name: "Aanya Sharma",
    role: "Pre-med · Year 3",
    body: "I went from drowning in PDFs to a calm, scheduled revision plan. My recall before exams is night and day.",
    rating: 5,
  },
  {
    name: "Rohit Verma",
    role: "CS · Year 2",
    body: "The smart search alone is worth it. I ask questions in plain English and StudyVault pulls the exact note.",
    rating: 5,
  },
  {
    name: "Maya Iyer",
    role: "Law · Final year",
    body: "Priority-based revision is genius. I stop wasting hours on stuff I already know.",
    rating: 5,
  },
  {
    name: "Kabir Anand",
    role: "MBA · Year 1",
    body: "My weekly mastery curve keeps me honest. Streak: 73 days and counting.",
    rating: 5,
  },
  {
    name: "Sara Khan",
    role: "Architecture · Year 4",
    body: "I love the analytics. It's like having a study coach who actually knows my data.",
    rating: 5,
  },
  {
    name: "Ishaan Patel",
    role: "Engineering · Year 3",
    body: "Spam detection cleans up my messy lecture dumps automatically. Sanity preserved.",
    rating: 5,
  },
];

const stories = [
  {
    metric: "+38%",
    label: "Average exam score lift",
    desc: "Across 1,200 students who used StudyVault for one full semester.",
  },
  {
    metric: "5h",
    label: "Saved per week",
    desc: "Time reclaimed from organizing, searching, and re-reading scattered notes.",
  },
  {
    metric: "92%",
    label: "Recall after 30 days",
    desc: "Concepts mastered through spaced repetition, vs. 28% with passive review.",
  },
];

function TestimonialsPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Student stories"
          title={
            <>
              Real students. <span className="text-gradient">Real momentum.</span>
            </>
          }
          description="Productivity gains and exam wins, in their own words."
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {stories.map((s, i) => (
            <div
              key={s.metric}
              className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-card"
            >
              <div
                aria-hidden
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-black text-white"
              >
                {
                  [
                    <TrendingUp key="t" className="h-5 w-5" />,
                    <Clock key="c" className="h-5 w-5" />,
                    <Award key="a" className="h-5 w-5" />,
                  ][i]
                }
              </div>
              <div className="text-5xl font-semibold text-black">{s.metric}</div>
              <div className="mt-2 font-semibold">{s.label}</div>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="columns-1 gap-5 md:columns-2 lg:columns-3 *:mb-5 *:break-inside-avoid">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <Quote className="h-6 w-6 text-primary/40" />
              <p className="mt-3 text-sm leading-relaxed">{r.body}</p>
              <div className="mt-4 flex gap-0.5 text-gray-500">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-black text-sm font-bold text-white">
                  {r.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
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
