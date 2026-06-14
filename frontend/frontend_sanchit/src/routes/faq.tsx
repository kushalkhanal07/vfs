import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, Plus, Minus } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeading, CTASection } from "@/components/marketing";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Sanchit" },
      {
        name: "description",
        content: "Answers to the most common questions about Sanchit — a vault for learning.",
      },
      { property: "og:title", content: "FAQ — Sanchit" },
      { property: "og:description", content: "Common questions, clear answers." },
    ],
  }),
  component: FAQPage,
});

const data = [
  {
    category: "Getting started",
    items: [
      {
        q: "What is Sanchit?",
        a: "Sanchit is a smart academic vault that combines storage, semantic search, spam filtering, and spaced repetition to help students learn deeply.",
      },
      {
        q: "How do I create my vault?",
        a: "Sign up free, drop your first notes or PDFs, and Sanchit will auto-organize and index everything in seconds.",
      },
      {
        q: "Is there a mobile app?",
        a: "A responsive web app is available now; native iOS and Android apps are in active development.",
      },
    ],
  },
  {
    category: "Learning & revision",
    items: [
      {
        q: "How does spaced repetition work?",
        a: "We schedule reviews at increasing intervals based on your performance, timed to the moment you're about to forget.",
      },
      {
        q: "What is priority-based revision?",
        a: "We rank concepts by mastery, recency, and exam weightage, so the most important and weakest areas surface first.",
      },
      {
        q: "Can I import flashcards?",
        a: "Yes — Anki-style decks and CSV imports are supported. Your existing material plugs right in.",
      },
    ],
  },
  {
    category: "Privacy & security",
    items: [
      {
        q: "Is my data secure?",
        a: "Yes. All files are encrypted in transit and at rest. You control sharing at the folder and file level.",
      },
      {
        q: "Can I export my vault?",
        a: "Anytime. Export as Markdown, PDF, or a structured archive. Your knowledge is always yours.",
      },
    ],
  },
  {
    category: "Pricing",
    items: [
      {
        q: "Is Sanchit free?",
        a: "There's a generous free tier. Pro adds advanced analytics, unlimited vaults, and priority support.",
      },
      {
        q: "Do you offer student discounts?",
        a: "Pro is heavily discounted for verified students and free for accredited institutions in pilot programs.",
      },
    ],
  },
];

function FAQPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [query]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 pt-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Help center"
          title={
            <>
              How can we <span className="text-gradient">help?</span>
            </>
          }
          description="Search our knowledge base or browse by category."
        />
        <div className="relative mt-8">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="h-14 rounded-2xl pl-11 text-base shadow-card"
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold">No results found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different keyword, or contact us directly.
            </p>
          </div>
        ) : (
          filtered.map((cat) => (
            <div key={cat.category}>
              <h3 className="font-display text-lg font-bold">{cat.category}</h3>
              <div className="mt-4 space-y-3">
                {cat.items.map((it, i) => (
                  <FAQItem key={i} q={it.q} a={it.a} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <CTASection />
    </SiteLayout>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-elevated">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium">{q}</span>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-muted-foreground">
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground animate-fade-in-up">
          {a}
        </div>
      )}
    </div>
  );
}
