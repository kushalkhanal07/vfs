import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TopLoadingBarProps {
  /** When true the bar is shown at the very top of the viewport. */
  active: boolean;
  /** Color treatment. "warning" = orange (slow), "brand" = primary blue. */
  tone?: "warning" | "brand";
  className?: string;
}

/**
 * Thin fixed progress bar pinned to the top of the page — the YouTube /
 * Messenger style indeterminate top loader. Used here to signal a slow
 * connection, but reusable for route transitions or any global pending state.
 */
export function TopLoadingBar({ active, tone = "brand", className }: TopLoadingBarProps) {
  const reduceMotion = useReducedMotion();

  const trackTone =
    tone === "warning" ? "bg-amber-500/20" : "bg-primary/20";
  const barTone =
    tone === "warning" ? "bg-amber-500" : "bg-primary";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="progressbar"
          aria-label="Network activity"
          aria-busy="true"
          className={cn(
            "fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden",
            trackTone,
            className,
          )}
        >
          {reduceMotion ? (
            // Reduced motion: a calm static-ish bar instead of the sweep.
            <div className={cn("absolute inset-y-0 left-0 w-1/3", barTone)} />
          ) : (
            <span className={cn("top-bar-indeterminate", barTone)} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
