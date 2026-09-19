import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ───────────────────────────── Shimmer skeleton ──────────────────────────── */

export interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use the sweeping shimmer (default) or fall back to a simple pulse. */
  variant?: "shimmer" | "pulse";
}

/**
 * Skeleton placeholder. Defaults to the Facebook/Messenger sweeping shimmer;
 * `variant="pulse"` matches the existing ui/skeleton pulse. Respects
 * prefers-reduced-motion via CSS (the sweep is disabled, block stays visible).
 */
export function Shimmer({ className, variant = "shimmer", ...props }: ShimmerProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-md",
        variant === "shimmer" ? "skeleton-shimmer" : "animate-pulse bg-primary/10",
        className,
      )}
      {...props}
    />
  );
}

/* ───────────────────────────── Spinner ──────────────────────────── */

export interface SpinnerProps {
  className?: string;
  label?: string;
}

/** Small spinner. Per the spec we only render this on slow connections. */
export function Spinner({ className, label }: SpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground" role="status">
      <Loader2 className={cn("h-4 w-4 animate-spin-slow", className)} aria-hidden />
      {label ? <span className="text-xs">{label}</span> : <span className="sr-only">Loading</span>}
    </span>
  );
}

/* ───────────────────────────── Composed skeletons ──────────────────────────── */

/** Chat bubble placeholder, optionally aligned right (outgoing). */
export function MessageSkeleton({ outgoing = false }: { outgoing?: boolean }) {
  return (
    <div className={cn("flex items-end gap-2", outgoing && "flex-row-reverse")}>
      {!outgoing && <Shimmer className="h-8 w-8 shrink-0 rounded-full" />}
      <div className={cn("flex flex-col gap-1.5", outgoing && "items-end")}>
        <Shimmer className="h-9 w-48 rounded-2xl" />
        <Shimmer className="h-3 w-16 rounded" />
      </div>
    </div>
  );
}

/** A list of message skeletons for a conversation loading state. */
export function MessageListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading messages">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} outgoing={i % 3 === 0} />
      ))}
    </div>
  );
}

/** Card placeholder matching the app's rounded-3xl card style. */
export function CardSkeleton() {
  return (
    <div
      className="rounded-3xl border border-border bg-card p-6 shadow-card"
      role="status"
      aria-label="Loading"
    >
      <div className="flex items-center gap-3">
        <Shimmer className="h-12 w-12 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-1/2 rounded" />
          <Shimmer className="h-3 w-1/3 rounded" />
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <Shimmer className="h-3 w-full rounded" />
        <Shimmer className="h-3 w-11/12 rounded" />
        <Shimmer className="h-3 w-4/5 rounded" />
      </div>
    </div>
  );
}

/**
 * Inline placeholder for a single item that is still loading. Shows a pulsing
 * line always, plus a spinner only when the connection is slow (per spec).
 */
export function InlineLoader({
  slow = false,
  label = "Loading…",
  className,
}: {
  slow?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Shimmer className="h-3 flex-1 rounded" />
      {slow && <Spinner label={label} />}
    </div>
  );
}
