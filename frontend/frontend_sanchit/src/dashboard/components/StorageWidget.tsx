import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { HardDrive } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

interface StorageInfo {
  storageUsed: number;
  storageLimit: number;
  storagePercent: number;
  subscriptionActive: boolean;
}

export function StorageWidget() {
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const response = await axios.get(`${API_BASE}/user/storage`, {
          withCredentials: true,
        });
        setStorage(response.data);
      } catch (err) {
        console.error("Failed to fetch storage info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorage();

    // Listen for storage-updated event
    const handleStorageUpdate = () => {
      fetchStorage();
    };

    window.addEventListener("storage-updated", handleStorageUpdate);
    return () => {
      window.removeEventListener("storage-updated", handleStorageUpdate);
    };
  }, []);

  if (loading || !storage) {
    return (
      <div className="bg-blue-50 backdrop-blur border border-white/10 rounded-xl p-6 skeleton h-full min-h-40">
        <div className="h-4 bg-blue-100 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-blue-100 rounded w-full mb-4"></div>
        <div className="h-2 bg-blue-100 rounded w-full"></div>
      </div>
    );
  }

  const usedMB = (storage.storageUsed / 1048576).toFixed(2);
  const limitMB = (storage.storageLimit / 1048576).toFixed(2);
  const remaining = storage.storageLimit - storage.storageUsed;
  const remainingMB = (remaining / 1048576).toFixed(2);

  // Use purposeful solid colors for storage states: blue (ok), amber (high), rose (critical)
  const getProgressColor = (percent: number) => {
        // Blue-only theme: different blue shades for levels
        if (percent <= 70) return "bg-blue-600";
        if (percent <= 89) return "bg-blue-500";
        return "bg-blue-700";
  };

  const getProgressBgColor = (percent: number) => {
      return "bg-blue-50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-blue-200 bg-white p-6 shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
            <div className="rounded-lg border-2 border-blue-200 bg-white p-2">
              <HardDrive className="h-5 w-5 text-blue-900" />
            </div>
          <div>
              <h3 className="font-medium text-blue-900">Storage</h3>
              <p className="text-xs text-blue-400">{storage.storagePercent}% used</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-blue-50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${storage.storagePercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${getProgressColor(storage.storagePercent)}`}
          />
        </div>
        <p className="text-sm text-blue-900/80">
          {usedMB} MB of {limitMB} MB used
        </p>
      </div>

      {/* Storage Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-xs text-blue-400">Used</p>
          <p className="font-semibold text-blue-900">{usedMB} MB</p>
        </div>
        <div>
          <p className="text-xs text-blue-400">Remaining</p>
          <p className="font-semibold text-blue-900">{remainingMB} MB</p>
        </div>
      </div>

      {/* Warning Messages */}
      {storage.storagePercent >= 90 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3"
        >
          <p className="text-xs font-semibold text-blue-900">
            Storage almost full. Delete files to free up space.
          </p>
        </motion.div>
      )}

      {storage.storagePercent >= 71 && storage.storagePercent < 90 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3"
        >
          <p className="text-xs font-semibold text-blue-900">
            Storage usage is high. Consider upgrading or deleting files.
          </p>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Manage Files →
      </motion.button>
        {storage.subscriptionActive && (
          <div className="mt-2 flex items-center gap-2 px-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">✓</span>
            <p className="text-xs text-blue-800">Subscription active</p>
          </div>
        )}
    </motion.div>
  );
}
