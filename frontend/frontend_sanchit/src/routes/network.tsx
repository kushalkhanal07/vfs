import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Wifi, WifiOff, Gauge, Timer, Activity, Send, RefreshCw, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { SectionHeading } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import {
  useNetwork,
  NetworkActionButton,
  CardSkeleton,
  MessageListSkeleton,
  InlineLoader,
} from "@/components/network";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Network — StudyVault" },
      {
        name: "description",
        content:
          "Live connection status, speed detection, and Messenger-style loading UX for the current device.",
      },
    ],
  }),
  component: NetworkPage,
});

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wifi;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-7 shadow-card">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-sm font-semibold text-muted-foreground">{label}</h3>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}

function NetworkPage() {
  const net = useNetwork();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const isSlow = net.online && net.speed === "slow";

  const speedTone =
    net.speed === "offline"
      ? "text-destructive"
      : net.speed === "slow"
        ? "text-amber-500"
        : net.speed === "fast"
          ? "text-emerald-500"
          : "text-muted-foreground";

  // Demo: a fake request that respects the simulated connection.
  function runLoadingDemo() {
    setLoadingDemo(true);
    const delay = isSlow ? 3500 : 1200;
    setTimeout(() => setLoadingDemo(false), delay);
  }

  // Demo "send": resolves after a short delay. Offline → it queues.
  const fakeSend = () =>
    new Promise((resolve) => setTimeout(resolve, isSlow ? 2500 : 900));

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 pt-20 pb-10 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Diagnostics"
          title={
            <>
              Your <span className="text-gradient">network status</span>
            </>
          }
          description="Live readings plus the Messenger-style network UX. Toggle Wi-Fi or throttle in DevTools (Network → throttling) to watch toasts, the top loading bar, and pending states react in real time."
        />
      </section>

      {/* Live status */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3 rounded-3xl border border-border bg-card p-6 shadow-card">
          {net.verifying ? (
            <Loader2 className="h-8 w-8 animate-spin-slow text-primary" />
          ) : net.online ? (
            <Wifi className="h-8 w-8 text-emerald-500" />
          ) : (
            <WifiOff className="h-8 w-8 text-destructive" />
          )}
          <div className="flex-1">
            <p className="font-display text-xl font-bold">Live network diagnostics</p>
            <p className="text-sm text-muted-foreground">
              Connection updates now appear as compact toasts in the top-right corner.
            </p>
          </div>
          {net.pendingCount > 0 && (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600">
              {net.pendingCount} queued
            </span>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Activity} label="Effective type" value={net.effectiveType ?? "—"} />
          <Stat
            icon={Gauge}
            label="Downlink (Mbps)"
            value={net.downlink != null ? net.downlink : "—"}
          />
          <Stat icon={Timer} label="RTT (ms)" value={net.rtt != null ? net.rtt : "—"} />
          <Stat
            icon={Timer}
            label="Probe (ms)"
            value={net.probeMs != null ? net.probeMs : "—"}
          />
        </div>
      </section>

      {/* Loading-state demos */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-bold">Loading & action states</h2>
          <Button variant="outline" size="sm" onClick={runLoadingDemo} disabled={loadingDemo}>
            <RefreshCw className={loadingDemo ? "animate-spin-slow" : ""} />
            Simulate fetch
          </Button>
          <NetworkActionButton action={fakeSend} actionLabel="Send message" size="sm">
            <Send /> Send (try going offline)
          </NetworkActionButton>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card content with skeleton */}
          <div>
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Card content</p>
            {loadingDemo ? (
              <CardSkeleton />
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    <Wifi className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">Connection card</p>
                    <p className="text-sm text-muted-foreground">Loaded content goes here.</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  When a fetch is in flight this swaps to a shimmer skeleton instead of a
                  spinner — the Facebook/Messenger pattern. Hit “Simulate fetch”.
                </p>
              </div>
            )}
          </div>

          {/* Chat with message skeletons */}
          <div>
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Conversation</p>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              {loadingDemo ? (
                <MessageListSkeleton count={4} />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-primary/15" />
                    <div className="rounded-2xl bg-muted px-4 py-2 text-sm">Hey! Loaded ✨</div>
                  </div>
                  <div className="flex flex-row-reverse items-end gap-2">
                    <div className="rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                      Skeletons show only while fetching.
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-5">
                <InlineLoader slow={isSlow} label="Slow network — hang tight" />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Tip: the Network Information API (<code>navigator.connection</code>) is Chromium-only.
          On Firefox/Safari this hook falls back to timing a tiny fetch (shown as the “probe”
          value) to estimate slow/fast. All animations respect{" "}
          <span className="font-semibold">prefers-reduced-motion</span>.
        </p>
      </section>
    </SiteLayout>
  );
}
