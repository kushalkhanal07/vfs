import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Search, FileText, BookOpen, Filter, ArrowUpRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

const suggestions = ["Photosynthesis stages", "Newton's third law", "World War 2 causes", "Big-O notation", "Eigenvalues"];

const results = [
  {
    title: "Photosynthesis — Light & Dark Reactions",
    snippet: "...the **light reactions** occur in the thylakoid membrane and produce ATP and NADPH used by the Calvin cycle...",
    type: "Note",
    subject: "Biology",
    score: 98,
  },
  {
    title: "Chapter 4 — Plant Energy Conversion.pdf",
    snippet: "...absorbed light energy is converted into chemical energy stored in glucose. The overall equation balances 6CO₂ + 6H₂O...",
    type: "PDF",
    subject: "Biology",
    score: 92,
  },
  {
    title: "Lecture: Chloroplast Structure",
    snippet: "...stroma houses the dark reactions while grana stack thylakoids for the light-dependent steps...",
    type: "Video",
    subject: "Biology",
    score: 86,
  },
  {
    title: "Quick Revision Card — C3 vs C4 Plants",
    snippet: "C4 plants have an additional carbon-fixation step that improves efficiency in hot, arid climates...",
    type: "Note",
    subject: "Biology",
    score: 78,
  },
];

function SearchPage() {
  const [q, setQ] = useState("photosynthesis");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center pt-4">
        <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium mb-3">
          <Sparkles className="size-3" /> AI-powered semantic search
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Find anything in your <span className="text-gradient">vault</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Ask in plain language — StudyVault ranks results by meaning, not keywords.
        </p>
      </div>

      <div className="glass-strong rounded-2xl p-3 shadow-elegant">
        <div className="flex items-center gap-3 px-2">
          <Search className="size-5 text-primary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try: 'How does the Calvin cycle work?'"
            className="flex-1 bg-transparent outline-none text-base py-2 placeholder:text-muted-foreground"
          />
          <button className="p-2 rounded-lg hover:bg-muted">
            <Filter className="size-4 text-muted-foreground" />
          </button>
          <button className="hidden sm:inline-flex items-center gap-1.5 rounded-xl gradient-primary text-primary-foreground px-3 py-1.5 text-sm font-medium">
            Search
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setQ(s)}
            className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* AI summary */}
      <div className="glass rounded-2xl p-5 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-7 rounded-lg gradient-primary grid place-items-center text-white">
            <Sparkles className="size-3.5" />
          </div>
          <p className="text-sm font-semibold">Summary</p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Photosynthesis is the process by which green plants convert light energy into chemical energy.
          It occurs in two main stages: the <span className="text-foreground font-medium">light reactions</span>
          {" "}in the thylakoid membrane (producing ATP and NADPH) and the
          {" "}<span className="text-foreground font-medium">Calvin cycle</span> in the stroma
          (fixing CO₂ into glucose). Found across <span className="text-primary font-medium">12 notes</span> and
          {" "}<span className="text-primary font-medium">4 PDFs</span> in your vault.
        </p>
      </div>

      {/* Results */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground px-1">{results.length} ranked results</p>
        {results.map((r) => (
          <div key={r.title} className="glass rounded-2xl p-4 hover-lift cursor-pointer group">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl gradient-soft grid place-items-center text-primary shrink-0">
                {r.type === "PDF" ? <FileText className="size-5" /> : <BookOpen className="size-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm truncate">{r.title}</h3>
                  <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p
                  className="text-sm text-muted-foreground mt-1 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: r.snippet.replace(/\*\*(.+?)\*\*/g, "<mark class='bg-primary/20 text-foreground rounded px-0.5'>$1</mark>") }}
                />
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {r.type}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{r.subject}</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full gradient-primary" style={{ width: `${r.score}%` }} />
                    </div>
                    <span className="text-[11px] text-muted-foreground tabular-nums">{r.score}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
