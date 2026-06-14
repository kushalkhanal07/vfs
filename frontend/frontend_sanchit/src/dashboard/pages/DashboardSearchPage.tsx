import {
  Sparkles,
  Search as SearchIcon,
  FileText,
  BookOpen,
  Filter,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { useEffect } from "react";
import { SearchProvider, useSearch } from "@/contexts/searchContext";

function SearchInner() {
  const {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
  } = useSearch() as {
    query: string;
    setQuery: (value: string) => void;
    results: Array<{
      id: string;
      type: string;
      title: string;
      snippet?: string;
      subject?: string;
      score: number;
    }>;
    loading: boolean;
    error: string | null;
    search: (value: string) => void;
  };

  useEffect(() => {
    // initial search - respect ?q= query param when present
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || query || "photosynthesis";
    setQuery(q);
    search(q);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center pt-4">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-black">
          <Sparkles className="size-3" /> AI-powered semantic search
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Find anything in your <span className="text-gradient">vault</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Ask in plain language — Sanchit ranks results by meaning, not keywords.
        </p>
      </div>

      <div className="glass-strong rounded-2xl p-3 shadow-elegant">
        <div className="flex items-center gap-3 px-2">
          <SearchIcon className="size-5 text-black" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") search(query);
            }}
            placeholder="Try: 'How does the Calvin cycle work?'"
            className="flex-1 bg-transparent outline-none text-base py-2 placeholder:text-muted-foreground"
          />
          <button className="rounded-lg p-2 hover:bg-gray-100" onClick={() => search(query)}>
            <Filter className="size-4 text-gray-500" />
          </button>
          <button
            className="hidden rounded-xl bg-black px-3 py-1.5 text-sm font-medium text-white sm:inline-flex"
            onClick={() => search(query)}
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">Try:</span>
        {[
          "Photosynthesis stages",
          "Newton's third law",
          "World War 2 causes",
          "Big-O notation",
          "Eigenvalues",
        ].map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuery(s);
              search(s);
            }}
            className="rounded-full bg-gray-100 px-3 py-1.5 text-xs transition-colors hover:bg-gray-200"
          >
            {s}
          </button>
        ))}
      </div>

      {/* AI summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-none">
        <div className="flex items-center gap-2 mb-3">
          <div className="grid size-7 place-items-center rounded-lg bg-black text-white">
            <Sparkles className="size-3.5" />
          </div>
          <p className="text-sm font-semibold">Summary</p>
        </div>
        <p className="text-sm leading-relaxed text-gray-600">
          Photosynthesis is the process by which green plants convert light energy into chemical
          energy. It occurs in two main stages: the{" "}
          <span className="text-foreground font-medium">light reactions</span> in the thylakoid
          membrane (producing ATP and NADPH) and the{" "}
          <span className="text-foreground font-medium">Calvin cycle</span> in the stroma (fixing
          CO₂ into glucose). Found across <span className="text-primary font-medium">12 notes</span>{" "}
          and <span className="text-primary font-medium">4 PDFs</span> in your vault.
        </p>
      </div>

      {/* Results */}
      <div className="space-y-2">
        <p className="px-1 text-xs text-gray-500">{(results || []).length} ranked results</p>
        {loading ? (
          <div className="p-6 text-center">
            <Loader2 className="animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Searching...</p>
          </div>
        ) : (results || []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-sm text-gray-500">
            No results found for "{query}".
          </div>
        ) : (
          (results || []).map((r) => (
            <div key={r.id} className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 shadow-none transition-colors hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gray-100 text-black">
                  {r.type === "file" ? <FileText className="size-5" /> : <BookOpen className="size-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm truncate">{r.title}</h3>
                    <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: r.snippet || "" }} />
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black">{r.type}</span>
                    <span className="text-[11px] text-gray-500">{r.subject}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full bg-black" style={{ width: `${r.score}%` }} />
                      </div>
                      <span className="tabular-nums text-[11px] text-gray-500">{r.score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function DashboardSearchPage() {
  return (
    <SearchProvider>
      <SearchInner />
    </SearchProvider>
  );
}
