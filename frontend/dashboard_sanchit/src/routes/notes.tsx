import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Hash, Bold, Italic, List, Link2, Image, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/notes")({
  component: NotesPage,
});

const notes = [
  {
    id: "1",
    title: "Cellular Respiration",
    preview: "Aerobic respiration occurs in the mitochondria and produces 36-38 ATP…",
    tags: ["Biology", "Bio-chem"],
    time: "2h ago",
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: "2",
    title: "Linear Transformations",
    preview: "A linear map T: V → W between vector spaces preserves vector addition and scalar mult…",
    tags: ["Math", "Linear Algebra"],
    time: "Yesterday",
    color: "from-indigo-400 to-purple-500",
  },
  {
    id: "3",
    title: "French Revolution Causes",
    preview: "Economic crisis, Enlightenment ideas, weak monarchy, and social inequality…",
    tags: ["History"],
    time: "2 days",
    color: "from-rose-400 to-pink-500",
  },
  {
    id: "4",
    title: "Big-O Notation",
    preview: "Describes the upper bound of an algorithm's running time as input grows…",
    tags: ["CS", "DSA"],
    time: "3 days",
    color: "from-cyan-400 to-blue-500",
  },
];

function NotesPage() {
  const [active, setActive] = useState(notes[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 max-w-7xl mx-auto h-[calc(100vh-9rem)]">
      {/* List */}
      <div className="glass rounded-2xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border space-y-2">
          <button className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl gradient-primary text-primary-foreground py-2 text-sm font-medium shadow-soft">
            <Plus className="size-4" /> New note
          </button>
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              placeholder="Search notes…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => setActive(n)}
              className={`w-full text-left rounded-xl p-3 transition-colors ${
                active.id === n.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent/60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`size-1.5 rounded-full bg-gradient-to-br ${n.color}`} />
                <p className="text-sm font-medium truncate flex-1">{n.title}</p>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{n.preview}</p>
              <div className="flex items-center gap-1.5 mt-2">
                {n.tags.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {t}
                  </span>
                ))}
                <span className="text-[10px] text-muted-foreground ml-auto">{n.time}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="glass rounded-2xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border flex items-center gap-1 flex-wrap">
          {[Bold, Italic, List, Hash, Link2, Image].map((I, i) => (
            <button key={i} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <I className="size-4" />
            </button>
          ))}
          <div className="h-5 w-px bg-border mx-1" />

        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              {active.tags.map((t) => (
                <span key={t} className="text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                  #{t}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">{active.title}</h1>
            <p className="text-xs text-muted-foreground mb-8">Last edited {active.time}</p>

            <div className="prose prose-sm max-w-none space-y-4 text-[15px] leading-relaxed">
              <p>{active.preview}</p>
              <p>
                The process unfolds in three main stages — each with characteristic substrates,
                enzymes, and energy yields. Below is a summary table for quick revision.
              </p>
              <h2 className="text-lg font-semibold tracking-tight pt-2">Key Points</h2>
              <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                <li>Stage one converts glucose into pyruvate.</li>
                <li>Stage two oxidises pyruvate inside the mitochondrial matrix.</li>
                <li>Stage three uses the electron transport chain to produce most ATP.</li>
              </ul>
              <div className="rounded-xl gradient-soft p-4 border border-border mt-4">
                <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Tip</p>
                <p className="text-sm">Memorise the net ATP yield per stage — it's a frequent exam question.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
