import * as React from "react";
import { Loader2, Clock } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNetwork } from "./network-provider";

export interface NetworkActionButtonProps extends Omit<ButtonProps, "onClick"> {
  /**
   * The async action to perform. When offline it's queued via the network
   * provider and runs automatically once the connection returns.
   */
  action: () => Promise<unknown>;
  /** Label shown while the request is in flight. */
  pendingLabel?: string;
  /** Label shown while queued offline. */
  queuedLabel?: string;
  /** Human-readable name used for the queued entry. */
  actionLabel?: string;
}

/**
 * A Button that is network-aware:
 *  - offline → greyed out, click queues the action and shows a "pending" state
 *  - in flight → spinner + pending label
 *  - back online → queued action auto-runs (handled by NetworkProvider)
 */
export const NetworkActionButton = React.forwardRef<
  HTMLButtonElement,
  NetworkActionButtonProps
>(function NetworkActionButton(
  {
    action,
    children,
    pendingLabel = "Sending…",
    queuedLabel = "Pending — will send when online",
    actionLabel,
    disabled,
    className,
    ...props
  },
  ref,
) {
  const { online, enqueue } = useNetwork();
  const [state, setState] = React.useState<"idle" | "sending" | "queued">("idle");

  const handleClick = React.useCallback(async () => {
    // Optimistically reflect the right pending state.
    setState(online ? "sending" : "queued");
    try {
      await enqueue(action, { label: actionLabel });
    } finally {
      setState("idle");
    }
  }, [online, enqueue, action, actionLabel]);

  const isBusy = state !== "idle";

  return (
    <Button
      ref={ref}
      type="button"
      onClick={handleClick}
      // Grey out while offline (unless mid-flight queue) and while busy.
      disabled={disabled || isBusy}
      aria-busy={isBusy}
      className={cn(!online && state === "idle" && "opacity-60", className)}
      {...props}
    >
      {state === "sending" && <Loader2 className="animate-spin-slow" />}
      {state === "queued" && <Clock />}
      {state === "sending" ? pendingLabel : state === "queued" ? queuedLabel : children}
    </Button>
  );
});
