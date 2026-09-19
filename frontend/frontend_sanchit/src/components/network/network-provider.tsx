import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Wifi, WifiOff, Gauge, SignalLow, Loader2 } from "lucide-react";
import {
  useNetworkSpeed,
  type NetworkState,
  type UseNetworkSpeedOptions,
} from "@/hooks/use-network-speed";
import { TopLoadingBar } from "./top-loading-bar";

const OFFLINE_TOAST_ID = "network-offline";
const SLOW_TOAST_ID = "network-slow";
const POOR_TOAST_ID = "network-poor";
const ONLINE_TOAST_ID = "network-online";
const CONNECTING_TOAST_ID = "network-connecting";

interface QueuedTask<T = unknown> {
  run: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  label?: string;
}

export interface NetworkContextValue extends NetworkState {
  /** Number of actions waiting for the connection to return. */
  pendingCount: number;
  /**
   * Run a task now if online, otherwise queue it and run automatically when
   * the connection returns. Resolves/rejects with the task's result.
   */
  enqueue: <T>(run: () => Promise<T>, opts?: { label?: string }) => Promise<T>;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext);
  if (!ctx) {
    throw new Error("useNetwork must be used within a <NetworkProvider>");
  }
  return ctx;
}

export interface NetworkProviderProps {
  children: React.ReactNode;
  /** Show the global top loading bar while the connection is slow. */
  showTopBar?: boolean;
  /** Forwarded to the underlying useNetworkSpeed hook. */
  detection?: UseNetworkSpeedOptions;
}

export function NetworkProvider({
  children,
  showTopBar = true,
  detection,
}: NetworkProviderProps) {
  const net = useNetworkSpeed(detection);

  const queueRef = useRef<QueuedTask[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const flushingRef = useRef(false);

  // Track previous values so we only toast on actual transitions.
  const prevOnline = useRef(net.online);
  const prevSpeed = useRef(net.speed);
  const prevPoor = useRef(net.poor);
  const prevVerifying = useRef(false);
  const mounted = useRef(false);

  const flushQueue = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;
    try {
      while (queueRef.current.length > 0 && typeof navigator !== "undefined" && navigator.onLine) {
        const task = queueRef.current.shift()!;
        setPendingCount(queueRef.current.length);
        try {
          const result = await task.run();
          task.resolve(result);
        } catch (err) {
          task.reject(err);
        }
      }
    } finally {
      flushingRef.current = false;
      setPendingCount(queueRef.current.length);
    }
  }, []);

  const enqueue = useCallback(
    <T,>(run: () => Promise<T>, opts?: { label?: string }): Promise<T> => {
      const online = typeof navigator === "undefined" ? true : navigator.onLine;
      if (online) return run();

      return new Promise<T>((resolve, reject) => {
        queueRef.current.push({
          run: run as () => Promise<unknown>,
          resolve: resolve as (v: unknown) => void,
          reject,
          label: opts?.label,
        });
        setPendingCount(queueRef.current.length);
      });
    },
    [],
  );

  // Toast side-effects. Flow on load (and on every reconnect):
  //   Connecting…  →  Connected / Slow / Poor / Offline
  useEffect(() => {
    const dismissResolved = () => {
      toast.dismiss(OFFLINE_TOAST_ID);
      toast.dismiss(SLOW_TOAST_ID);
      toast.dismiss(POOR_TOAST_ID);
    };

    // While verifying / waiting for the network, keep a persistent "Connecting…"
    // toast with a spinner (sonner's loading toast renders the spinning loader).
    if (net.verifying) {
      dismissResolved();
      toast.loading("Connecting…", {
        id: CONNECTING_TOAST_ID,
        duration: Infinity,
        position: "top-right",
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
      });
      prevVerifying.current = true;
      return;
    }

    const firstRun = !mounted.current;
    mounted.current = true;
    const finishedVerifying = prevVerifying.current;
    prevVerifying.current = false;

    const showOffline = () =>
      toast.error("Offline", {
        id: CONNECTING_TOAST_ID,
        duration: Infinity,
        icon: <WifiOff className="h-4 w-4" />,
      });

    const showPoor = () =>
      toast.warning("Poor connection", {
        id: CONNECTING_TOAST_ID,
        duration: Infinity,
        icon: <SignalLow className="h-4 w-4" />,
      });

    const showSlow = () =>
      toast.warning("Slow connection", {
        id: CONNECTING_TOAST_ID,
        duration: 5000,
        icon: <Gauge className="h-4 w-4" />,
      });

    const showConnected = () => {
      window.setTimeout(() => {
        toast.success("Connected", {
          id: CONNECTING_TOAST_ID,
          duration: 3000,
          icon: <Wifi className="h-4 w-4" />,
        });
      }, 2000);
    };

    // Resolve the connecting state (initial mount or after a reconnect/retry),
    // and also handle the initial-offline boot case.
    if (firstRun || finishedVerifying) {
      if (!net.online) {
        showOffline();
      } else if (net.poor) {
        showPoor();
      } else if (net.speed === "slow") {
        showSlow();
        void flushQueue();
      } else {
        showConnected();
        void flushQueue();
      }
    } else {
      // Ongoing transitions after the initial resolve (no verify in between),
      // e.g. a connection "change" event flipping fast↔slow, or a hard offline.
      const wasOnline = prevOnline.current;
      const wasSpeed = prevSpeed.current;

      if (!net.online && wasOnline) {
        dismissResolved();
        showOffline();
      } else if (net.online && net.poor && !prevPoor.current) {
        showPoor();
      } else if (net.online && !net.poor && net.speed === "slow" && wasSpeed !== "slow") {
        toast.dismiss(POOR_TOAST_ID);
        showSlow();
      } else if (net.online && !net.poor && net.speed === "fast" && wasSpeed === "slow") {
        toast.dismiss(SLOW_TOAST_ID);
        toast.dismiss(POOR_TOAST_ID);
      }
    }

    prevOnline.current = net.online;
    prevSpeed.current = net.speed;
    prevPoor.current = net.poor;
  }, [net.verifying, net.online, net.speed, net.poor, flushQueue]);

  const value = useMemo<NetworkContextValue>(
    () => ({ ...net, pendingCount, enqueue }),
    [net, pendingCount, enqueue],
  );

  const degraded = net.online && (net.speed === "slow" || net.poor);

  return (
    <NetworkContext.Provider value={value}>
      {showTopBar && (
        <TopLoadingBar
          active={net.verifying || degraded}
          tone={degraded ? "warning" : "brand"}
        />
      )}
      {children}
    </NetworkContext.Provider>
  );
}
