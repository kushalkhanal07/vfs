import { useEffect, useState } from "react";

/** Subset of the Network Information API we read from. */
interface NetworkInformation extends EventTarget {
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number; // Mbps estimate
  rtt?: number; // ms round-trip-time estimate
  saveData?: boolean;
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
};

export type NetworkSpeed = "offline" | "slow" | "fast" | "unknown";

export interface NetworkState {
  online: boolean;
  speed: NetworkSpeed;
  /**
   * True while we're actively verifying the connection (initial mount check, a
   * reconnect, or retrying a flaky network). Drives the "Connecting…" UI.
   */
  verifying: boolean;
  /**
   * The browser reports online, but our probe couldn't reach the server (after
   * retries) — i.e. a bad/unstable connection rather than a clean offline.
   */
  poor: boolean;
  /** Where the reading came from — useful for debugging / UI hints. */
  source: "connection" | "probe" | "none";
  effectiveType?: NetworkInformation["effectiveType"];
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  /** Measured round-trip of the probe request, when the fallback is used. */
  probeMs?: number;
}

export interface UseNetworkSpeedOptions {
  /**
   * Same-origin URL fetched to measure latency. Should be tiny and
   * cache-bypassed. Used both as the Safari/Firefox fallback AND as the active
   * mount/reconnect check (since navigator.connection emits no change event on
   * first load).
   */
  probeUrl?: string;
  /** Above this round-trip (ms) the connection is treated as "slow". */
  slowProbeMs?: number;
  /** How often to re-check while online, in ms. 0 disables polling. */
  probeIntervalMs?: number;
  /** Per-probe network timeout (ms) before it's considered failed. */
  probeTimeoutMs?: number;
  /** How many times to retry a failed probe before declaring a bad connection. */
  probeRetries?: number;
  /** Delay (ms) between retry attempts while still "Connecting…". */
  retryDelayMs?: number;
}

const DEFAULTS: Required<UseNetworkSpeedOptions> = {
  probeUrl: "/favicon.ico",
  slowProbeMs: 600,
  probeIntervalMs: 30_000,
  probeTimeoutMs: 5_000,
  probeRetries: 3,
  retryDelayMs: 1_200,
};

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  const nav = navigator as NavigatorWithConnection;
  return nav.connection || nav.mozConnection || nav.webkitConnection;
}

function isConnectionSlow(conn?: NetworkInformation): boolean {
  return conn ? ["slow-2g", "2g", "3g"].includes(conn.effectiveType ?? "") : false;
}

function connectionFields(conn?: NetworkInformation) {
  return {
    effectiveType: conn?.effectiveType,
    downlink: conn?.downlink,
    rtt: conn?.rtt,
    saveData: conn?.saveData,
  };
}

/**
 * Detects online/offline status and a coarse fast/slow speed bucket, and
 * exposes a `verifying` flag for the initial / reconnect "Connecting…" state.
 *
 * On mount (and on every reconnect) it runs an *active* probe — timing a tiny
 * same-origin fetch — rather than relying on the Network Information API's
 * change event, which never fires for the current state on first load. The
 * probe also serves as the Safari/Firefox fallback where the API is absent.
 */
export function useNetworkSpeed(options: UseNetworkSpeedOptions = {}): NetworkState {
  const { probeUrl, slowProbeMs, probeIntervalMs, probeTimeoutMs, probeRetries, retryDelayMs } = {
    ...DEFAULTS,
    ...options,
  };

  const [net, setNet] = useState<NetworkState>(() => {
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;
    return {
      online,
      speed: online ? "unknown" : "offline",
      // Boot straight into "Connecting…" when we believe we're online.
      verifying: online,
      poor: false,
      source: "none",
    };
  });

  useEffect(() => {
    const conn = getConnection();
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    // Guards against overlapping verify runs (e.g. mount + quick online event).
    let verifyToken = 0;

    const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    /** Times a tiny fetch. Resolves to ms, or null if it failed/timed out. */
    async function probeTiming(): Promise<number | null> {
      if (typeof fetch === "undefined") return null;
      const start = now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), probeTimeoutMs);
        await fetch(`${probeUrl}?_n=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeout);
        return now() - start;
      } catch {
        return null;
      }
    }

    function setOffline() {
      setNet({ online: false, speed: "offline", poor: false, source: "none", verifying: false });
    }

    function resolveReachable(elapsed: number, conn2 = getConnection()) {
      const slow = isConnectionSlow(conn2) || elapsed > slowProbeMs;
      setNet({
        online: true,
        verifying: false,
        poor: false,
        speed: slow ? "slow" : "fast",
        source: conn2 ? "connection" : "probe",
        probeMs: Math.round(elapsed),
        ...connectionFields(conn2),
      });
    }

    /**
     * Active check used on mount and on reconnect. Stays in "Connecting…" while
     * it retries a flaky network, then resolves to fast / slow / poor / offline.
     */
    async function verifyConnection() {
      const token = ++verifyToken;
      const isStale = () => cancelled || token !== verifyToken;

      setNet((prev) => ({ ...prev, verifying: true }));

      for (let attempt = 1; attempt <= probeRetries; attempt++) {
        if (isStale()) return;

        // OS-level offline → no point probing; surface offline immediately.
        if (!navigator.onLine) {
          setOffline();
          return;
        }

        const elapsed = await probeTiming();
        if (isStale()) return;

        if (elapsed !== null) {
          resolveReachable(elapsed);
          return;
        }

        // Probe failed → keep "Connecting…" and retry after a short wait.
        if (attempt < probeRetries) {
          await delay(retryDelayMs);
          if (isStale()) return;
        }
      }

      // Exhausted retries.
      if (isStale()) return;
      if (!navigator.onLine) {
        setOffline();
        return;
      }
      // Browser says online but the server was unreachable → bad connection.
      const conn2 = getConnection();
      setNet({
        online: true,
        verifying: false,
        poor: true,
        speed: "slow",
        source: conn2 ? "connection" : "probe",
        ...connectionFields(conn2),
      });
    }

    /** Quiet update (no "Connecting…") for connection "change" + polling. */
    function silentRefresh() {
      if (!navigator.onLine) {
        setOffline();
        return;
      }
      const conn2 = getConnection();
      if (conn2) {
        setNet((prev) => ({
          ...prev,
          online: true,
          verifying: false,
          poor: false,
          speed: isConnectionSlow(conn2) ? "slow" : "fast",
          source: "connection",
          ...connectionFields(conn2),
        }));
      } else {
        void (async () => {
          const elapsed = await probeTiming();
          if (cancelled || !navigator.onLine) return;
          if (elapsed === null) {
            // Lost reachability between checks → re-verify (shows Connecting).
            void verifyConnection();
            return;
          }
          resolveReachable(elapsed);
        })();
      }
    }

    function handleOnline() {
      void verifyConnection();
    }

    // Active check on mount → drives "Connecting… → Connected / Slow / Offline".
    void verifyConnection();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", setOffline);
    conn?.addEventListener("change", silentRefresh);

    if (probeIntervalMs > 0) {
      intervalId = setInterval(() => {
        if (navigator.onLine) silentRefresh();
      }, probeIntervalMs);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", setOffline);
      conn?.removeEventListener("change", silentRefresh);
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [probeUrl, slowProbeMs, probeIntervalMs, probeTimeoutMs, probeRetries, retryDelayMs]);

  return net;
}
