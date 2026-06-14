import {
  Plus,
  Search,
  Hash,
  Bold,
  Italic,
  List,
  Link2,
  Image,
  Sparkles,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { useNotes } from "@/contexts/notesContext";
import { checkNoteCspa, checkNoteShield, mergeNote } from "@/api/notes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NoteItem = {
  _id: string;
  title: string;
  content?: string;
  tags?: string[];
  updatedAt?: string;
  lastEditedAt?: string;
};

const formatRelativeTime = (isoDate?: string) => {
  if (!isoDate) return "just now";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "just now";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString();
};

export function NotesPage() {
  const { notes, loading, error, create, load } = useNotes() as {
    notes: NoteItem[];
    loading: boolean;
    error: string | null;
    load: () => Promise<void>;
    create: (payload: {
      title: string;
      content?: string;
      tags?: string[];
      overrideDuplicate?: boolean;
    }) => Promise<NoteItem>;
  };

  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  
  // Similarity detection state
  const [spamScore, setSpamScore] = useState<number | null>(null);
  const [isSpam, setIsSpam] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [spamChecking, setSpamChecking] = useState(false);
  const [shieldChecking, setShieldChecking] = useState(false);
  const [isMalicious, setIsMalicious] = useState(false);
  const [overrideSpam, setOverrideSpam] = useState(false);
  const [bestMatch, setBestMatch] = useState<{
    noteId: string;
    title: string;
    tags?: string[];
    score?: number;
  } | null>(null);
  const [shieldScore, setShieldScore] = useState<number | null>(null);
  const [shieldFlags, setShieldFlags] = useState<string[]>([]);
  const spamCheckTimer = useRef<NodeJS.Timeout | null>(null);

  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsInput]
  );

  // Debounced similarity check
  useEffect(() => {
    if (spamCheckTimer.current) {
      clearTimeout(spamCheckTimer.current);
    }

    if (title.trim().length < 3 && content.trim().length < 10 && parsedTags.length === 0) {
      setSpamScore(null);
      setIsSpam(false);
      setIsWarning(false);
      setBestMatch(null);
      setShieldScore(null);
      setShieldFlags([]);
      setIsMalicious(false);
      return;
    }

    spamCheckTimer.current = setTimeout(async () => {
      try {
        setSpamChecking(true);
        setShieldChecking(true);

        const [cspaResult, shieldResult] = await Promise.allSettled([
          checkNoteCspa({
            title,
            content,
            tags: parsedTags,
          }),
          checkNoteShield({
            title,
            content,
          }),
        ]);

        if (cspaResult.status === "fulfilled") {
          const response = cspaResult.value;
          setSpamScore(response.similarityPercent ?? Math.round((response.similarityScore || 0) * 100));
          setIsSpam(Boolean(response.isDuplicate));
          setIsWarning(Boolean(response.isRelated));
          setBestMatch(response.bestMatch || null);
        }

        if (shieldResult.status === "fulfilled") {
          const response = shieldResult.value;
          setShieldScore(Math.round((response.threatScore || 0) * 100));
          setShieldFlags(Array.isArray(response.flags) ? response.flags : []);
          setIsMalicious(response.action !== "SAFE");
        }
      } catch (err) {
        console.error("Failed to check note similarity", err);
      } finally {
        setSpamChecking(false);
        setShieldChecking(false);
      }
    }, 1500); // Debounce for 1.5 seconds

    return () => {
      if (spamCheckTimer.current) clearTimeout(spamCheckTimer.current);
    };
  }, [title, content, parsedTags]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return notes;

    return notes.filter((note) => {
      const noteTitle = note.title?.toLowerCase() || "";
      const noteContent = note.content?.toLowerCase() || "";
      const noteTags = (note.tags || []).join(" ").toLowerCase();

      return (
        noteTitle.includes(query) || noteContent.includes(query) || noteTags.includes(query)
      );
    });
  }, [notes, search]);

  const active = useMemo(() => {
    if (filteredNotes.length === 0) return null;
    return filteredNotes.find((n) => n._id === activeId) || filteredNotes[0];
  }, [filteredNotes, activeId]);

  const handleCreateNote = async () => {
    if (!title.trim()) {
      setCreateError("Title is required");
      return;
    }

    // If spam detected and not overridden, prevent creation
    if (isMalicious) {
      setCreateError("This content appears to contain malicious code, scripts, or suspicious links.");
      return;
    }

    if (isSpam && !overrideSpam) {
      setCreateError("This content appears to be spam. Please edit or override.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const created = await create({
        title: title.trim(),
        content: content.trim(),
        tags: parsedTags,
        overrideDuplicate: overrideSpam,
      });

      setTitle("");
      setContent("");
      setTagsInput("");
      setActiveId(created._id);
      setIsCreateOpen(false);
      setOverrideSpam(false);
      setSpamScore(null);
      setIsSpam(false);
      setIsWarning(false);
      setBestMatch(null);
      setShieldScore(null);
      setShieldFlags([]);
      setIsMalicious(false);
    } catch (err: any) {
      if (err?.code === "MALICIOUS_NOTE") {
        setCreateError(err?.response?.data?.message || err.message);
      } else if (err?.code === "DUPLICATE_NOTE") {
        setCreateError(err?.response?.data?.message || err.message);
      } else {
        setCreateError(err instanceof Error ? err.message : "Failed to create note");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleMergeNote = async () => {
    if (!bestMatch?.noteId) {
      setCreateError("No note available to merge with.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await mergeNote({
        targetNoteId: bestMatch.noteId,
        title: title.trim(),
        content: content.trim(),
        tags: parsedTags,
      });

      await load();
      setActiveId(response?.note?._id || bestMatch.noteId);
      setTitle("");
      setContent("");
      setTagsInput("");
      setIsCreateOpen(false);
      setOverrideSpam(false);
      setSpamScore(null);
      setIsSpam(false);
      setIsWarning(false);
      setBestMatch(null);
      setShieldScore(null);
      setShieldFlags([]);
      setIsMalicious(false);
    } catch (err: any) {
      setCreateError(err instanceof Error ? err.message : "Failed to merge notes");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 max-w-7xl mx-auto h-[calc(100vh-9rem)]">
      {/* List */}
      <div className="glass rounded-2xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border space-y-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl gradient-primary text-primary-foreground py-2 text-sm font-medium shadow-soft"
          >
            <Plus className="size-4" /> New note
          </button>
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading && (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader className="mr-2 size-4 animate-spin" /> Loading notes...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && filteredNotes.length === 0 && (
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              No notes found. Create your first note.
            </div>
          )}

          {!loading &&
            filteredNotes.map((n) => (
              <button
                key={n._id}
                onClick={() => setActiveId(n._id)}
                className={`w-full text-left rounded-xl p-3 transition-colors ${
                  active?._id === n._id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent/60"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="size-1.5 rounded-full bg-linear-to-br from-cyan-400 to-blue-500" />
                  <p className="text-sm font-medium truncate flex-1">{n.title}</p>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {n.content?.trim() || "No content"}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  {(n.tags || []).slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {t}
                    </span>
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {formatRelativeTime(n.lastEditedAt || n.updatedAt)}
                  </span>
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
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-medium ml-auto">
            <Sparkles className="size-3.5" /> AI assist
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-2xl mx-auto">
            {active ? (
              <>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {(active.tags || []).map((t) => (
                    <span key={t} className="text-[11px] px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">{active.title}</h1>
                <p className="text-xs text-muted-foreground mb-8">
                  Last edited {formatRelativeTime(active.lastEditedAt || active.updatedAt)}
                </p>

                <div className="prose prose-sm max-w-none space-y-4 text-[15px] leading-relaxed">
                  <p className="whitespace-pre-wrap">{active.content?.trim() || "No content added yet."}</p>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
                Select a note from the list to preview it.
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create note</DialogTitle>
            <DialogDescription>
              Add a title, content, and optional tags. This will be saved to your notes collection.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note..."
                rows={8}
                className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              
              {/* Similarity Detection Warnings */}
              {spamChecking && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader className="size-3 animate-spin" />
                  Checking for related or duplicate notes...
                </div>
              )}

              {shieldChecking && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader className="size-3 animate-spin" />
                  Scanning for malicious content...
                </div>
              )}

              {isMalicious && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-red-700">SHIELD: Malicious content detected</p>
                      <p className="text-red-600/80 mt-1">
                        The note contains risky script, injection, or suspicious link patterns.
                        Score: {shieldScore}/100
                      </p>
                      {shieldFlags.length > 0 && (
                        <p className="mt-1 text-red-600/70">Flags: {shieldFlags.join(", ")}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isSpam && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-red-700">🚫 Duplicate Note Detected</p>
                      <p className="text-red-600/80 mt-1">
                        This note is probably a duplicate of an existing note.
                        Score: {spamScore}/100
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-red-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideSpam}
                      onChange={(e) => setOverrideSpam(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-xs">Create anyway</span>
                  </label>
                  {bestMatch && (
                    <button
                      type="button"
                      onClick={handleMergeNote}
                      className="inline-flex w-full items-center justify-center rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                      disabled={isCreating || isMalicious}
                    >
                      Merge with “{bestMatch.title}”
                    </button>
                  )}
                </div>
              )}

              {isWarning && !isSpam && (
                <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-3 py-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 text-yellow-600 mt-0.5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-yellow-700">⚠️ Related Note Found</p>
                      <p className="text-yellow-600/80">
                        Your note is {spamScore}% similar to an existing note. Consider linking or reviewing it.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="biology, exam, chapter-3"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            {createError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {createError}
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setOverrideSpam(false);
              }}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateNote}
              disabled={isCreating || isMalicious || (isSpam && !overrideSpam)}
              className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {isCreating ? <Loader className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {isMalicious ? "Blocked by SHIELD" : isSpam && !overrideSpam ? "Override to Create" : "Create note"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
