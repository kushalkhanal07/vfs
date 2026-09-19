import { useEffect, useState } from "react";
import { Loader2, Target } from "lucide-react";
import { getRevisionPriorities, type SubjectPriority } from "@/api/revision";

const levelClasses: Record<SubjectPriority["level"], string> = {
  High: "border-blue-800/30 bg-blue-800/10 text-blue-800 dark:text-blue-300",
  Medium: "border-blue-600/30 bg-blue-600/10 text-blue-600 dark:text-blue-300",
  Low: "border-blue-400/30 bg-blue-400/10 text-blue-400 dark:text-blue-300",
};

function describeFactors(factors: SubjectPriority["factors"]) {
  const parts: string[] = [];

  if (factors.daysSinceLastRevision === null) parts.push("never revised");
  else if (factors.daysSinceLastRevision === 0) parts.push("revised today");
  else parts.push(`${factors.daysSinceLastRevision}d since revision`);

  if (factors.recallScore !== null) parts.push(`recall ${factors.recallScore}/5`);

  if (factors.examDaysLeft !== null) {
    parts.push(factors.examDaysLeft === 0 ? "exam today" : `exam in ${factors.examDaysLeft}d`);
  }

  parts.push(`difficulty ${factors.difficulty}/5`);

  return parts.join(" • ");
}

type RevisionPriorityCardProps = {
  // Change this value to reload the ranking (for example the sessions list)
  refreshKey?: unknown;
  limit?: number;
  className?: string;
};

export function RevisionPriorityCard({ refreshKey, limit = 5, className = "" }: RevisionPriorityCardProps) {
  const [subjects, setSubjects] = useState<SubjectPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getRevisionPriorities()
      .then((data) => {
        if (!active) return;
        setSubjects(data.subjects || []);
        setError(null);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load priorities");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <div className={`rounded-2xl border border-border/70 bg-card p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Target className="size-4" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold tracking-tight">Revise first</h3>
          <p className="text-xs text-muted-foreground">
            Priority = 35% days since revision + 30% weakness + 20% exam urgency + 15% difficulty
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center py-4 text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" /> Calculating priorities…
        </div>
      ) : error ? (
        <div className="py-4 text-sm text-destructive">{error}</div>
      ) : subjects.length === 0 ? (
        <div className="py-4 text-sm text-muted-foreground">
          Add revision sessions to see which subject to revise first.
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.slice(0, limit).map((item, index) => (
            <div key={item.subject} className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-medium">{item.subject}</p>
                <span className="font-mono text-sm font-semibold">{item.score}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${levelClasses[item.level]}`}
                >
                  {item.level}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${item.score}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{describeFactors(item.factors)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
