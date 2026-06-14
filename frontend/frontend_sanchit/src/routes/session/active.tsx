import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

export const Route = createFileRoute("/session/active")({
  component: SessionActive,
});

interface SessionItem {
  _id: string;
  noteId: { _id: string; title: string; content: string; tags: string[] };
  order: number;
  status: "pending" | "in-progress" | "completed";
  notTitle: string;
  noteSubject: string;
  rating?: number;
  timeSpent?: number;
}

interface SessionData {
  _id: string;
  status: string;
  items: SessionItem[];
  stats: { itemsReviewed: number; itemsCount: number; avgConfidence: number };
}

function SessionActive() {
  const { sessionId } = useParams({ from: "/session/$sessionId/active" });
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionData | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const itemStartTime = useRef<number>(0);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await axios.get(`/api/sessions/${sessionId}`, {
          withCredentials: true,
        });
        setSession(response.data);
        
        // If session is setup, start it
        if (response.data.status === "setup") {
          await axios.patch(
            `/api/sessions/${sessionId}/start`,
            {},
            { withCredentials: true }
          );
        }

        setIsRunning(true);
        itemStartTime.current = Date.now();
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Restore from localStorage if page is refreshed
    const savedSessionId = localStorage.getItem("currentSessionId");
    if (!savedSessionId || savedSessionId !== sessionId) {
      localStorage.setItem("currentSessionId", sessionId);
    }
  }, [sessionId]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || !session) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          // Show end of session modal
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, session]);

  const handleRateItem = async (rating: 1 | 2 | 3 | 4) => {
    if (!session) return;

    const currentItem = session.items[currentItemIndex];
    const timeSpent = Math.round((Date.now() - itemStartTime.current) / 1000);

    try {
      await axios.post(
        `/api/sessions/${sessionId}/rate-item`,
        {
          itemId: currentItem._id,
          rating,
          timeSpent,
        },
        { withCredentials: true }
      );

      // Reload session to see updates
      const response = await axios.get(`/api/sessions/${sessionId}`, {
        withCredentials: true,
      });
      setSession(response.data);

      // Move to next item
      if (currentItemIndex < response.data.items.length - 1) {
        setCurrentItemIndex((prev) => prev + 1);
        itemStartTime.current = Date.now();
        setShowRating(false);
      } else {
        // All items done
        setShowRating(false);
        handleCompleteSession();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to rate item");
    }
  };

  const handleCompleteSession = async () => {
    try {
      await axios.post(
        `/api/sessions/${sessionId}/complete`,
        {},
        { withCredentials: true }
      );

      navigate({
        to: `/session/$sessionId/complete`,
        params: { sessionId },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to complete session");
    }
  };

  const handlePauseResume = async () => {
    try {
      if (isRunning) {
        await axios.patch(`/api/sessions/${sessionId}/pause`, {}, { withCredentials: true });
        setIsRunning(false);
      } else {
        await axios.patch(
          `/api/sessions/${sessionId}/resume`,
          {},
          { withCredentials: true }
        );
        setIsRunning(true);
        itemStartTime.current = Date.now();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to pause/resume session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
          <p className="text-lg text-black">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md rounded-xl border border-gray-200 bg-gray-100 p-8 text-center">
          <p className="text-lg font-semibold text-black">{error}</p>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-4 rounded-lg bg-black px-6 py-2 text-white hover:bg-black/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const currentItem = session.items[currentItemIndex];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    const percent = (timeRemaining / (session.stats.itemsCount * 300)) * 100;
    if (percent > 20) return "text-black";
    if (percent > 5) return "text-gray-600";
    return "text-gray-800";
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-black">Focus Session</h1>
            <p className="text-gray-500">Item {currentItemIndex + 1} of {session.stats.itemsCount}</p>
          </div>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-black transition-colors hover:bg-gray-100"
          >
            Exit
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Content Panel */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={currentItemIndex}
              className="h-full rounded-2xl border border-gray-200 bg-white p-8 shadow-none"
            >
              <div className="mb-4">
                <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-black">
                  {currentItem.noteSubject}
                </span>
              </div>

              <h2 className="mb-6 text-3xl font-semibold text-black">{currentItem.notTitle}</h2>

              <div className="prose max-w-none mb-8">
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                  {currentItem.noteId.content}
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between border-t border-gray-200 pt-4">
                <button
                  onClick={() =>
                    setCurrentItemIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentItemIndex === 0}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-black transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  ← Previous
                </button>

                <button
                  onClick={() =>
                    setCurrentItemIndex((prev) =>
                      Math.min(session.items.length - 1, prev + 1)
                    )
                  }
                  disabled={currentItemIndex === session.items.length - 1}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-black transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Timer & Rating Panel */}
          <div className="space-y-6">
            {/* Timer Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-none"
            >
              <p className="mb-4 text-sm font-medium text-gray-500">Time Remaining</p>
              <div className={`text-6xl font-bold font-mono mb-6 ${getTimerColor()}`}>
                {formatTime(timeRemaining)}
              </div>

              <div className="space-y-3">
                <motion.button
                  onClick={handlePauseResume}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full rounded-lg bg-black py-3 font-semibold text-white transition-colors hover:bg-black/90"
                >
                  {isRunning ? "Pause" : "Resume"}
                </motion.button>

                <button
                  onClick={() => setTimeRemaining((prev) => prev + 300)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
                >
                  +5 min
                </button>
              </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-none"
            >
              <h3 className="mb-4 font-semibold text-black">Session Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items Reviewed:</span>
                  <span className="font-bold">{session.stats.itemsReviewed}/{session.stats.itemsCount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Avg Confidence:</span>
                  <span className="font-bold">{session.stats.avgConfidence}%</span>
                </div>
              </div>
            </motion.div>

            {/* Rating Section */}
            {!showRating && currentItem.status !== "completed" && (
              <motion.button
                onClick={() => setShowRating(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full rounded-lg bg-black py-4 font-semibold text-white transition-colors hover:bg-black/90"
              >
                Rate This Item
              </motion.button>
            )}

            <AnimatePresence>
              {showRating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-none"
                >
                  <p className="mb-4 text-center font-semibold text-black">
                    How well did you know this?
                  </p>
                  <div className="space-y-3">
                    {[
                      { rating: 1, label: "Again", color: "bg-gray-800" },
                      { rating: 2, label: "Hard", color: "bg-gray-700" },
                      { rating: 3, label: "Good", color: "bg-gray-500" },
                      { rating: 4, label: "Easy", color: "bg-black" },
                    ].map(({ rating, label, color }) => (
                      <motion.button
                        key={rating}
                        onClick={() => handleRateItem(rating as any)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full rounded-lg ${color} py-3 font-semibold text-white transition-colors`}
                      >
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
