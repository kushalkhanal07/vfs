import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export const Route = createFileRoute("/session/complete")({
  component: SessionComplete,
});

interface CompletionData {
  success: boolean;
  sessionComplete: {
    duration: number;
    itemsReviewed: number;
    totalItems: number;
    avgConfidence: number;
    masteryDelta: number;
    weakItems: number;
    streakUpdated: boolean;
    itemBreakdown: Array<{
      topic: string;
      subject: string;
      rating: string;
      nextReview: string;
    }>;
  };
}

function SessionComplete() {
  const { sessionId } = useParams({ from: "/session/$sessionId/complete" });
  const navigate = useNavigate();

  const [data, setData] = useState<CompletionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompletion = async () => {
      try {
        const response = await axios.get(`/api/sessions/${sessionId}`, {
          withCredentials: true,
        });

        if (response.data.status === "complete") {
          // Convert to completion format
          const itemBreakdown = response.data.items.map((item: any) => ({
            topic: item.notTitle,
            subject: item.noteSubject,
            rating: getRatingLabel(item.rating),
            nextReview: formatDate(new Date(Date.now() + item.rating * 24 * 60 * 60 * 1000)),
          }));

          setData({
            success: true,
            sessionComplete: {
              duration: Math.round(
                (response.data.endTime - response.data.startTime) / 1000 / 60
              ),
              itemsReviewed: response.data.stats.itemsReviewed,
              totalItems: response.data.stats.itemsCount,
              avgConfidence: response.data.stats.avgConfidence,
              masteryDelta: response.data.stats.masteryDelta,
              weakItems: response.data.weakItems.length,
              streakUpdated: true,
              itemBreakdown,
            },
          });
        }
      } catch (err) {
        console.error("Failed to load session", err);
      } finally {
        setLoading(false);
      }
    };

    loadCompletion();
    localStorage.removeItem("currentSessionId");
  }, [sessionId]);

  const handleStartAnother = () => {
    navigate({ to: "/session/setup" });
  };

  const handleDashboard = () => {
    navigate({ to: "/dashboard" });
  };

  const handleReviewWeak = () => {
    navigate({
      to: "/dashboard/notes",
      search: { filter: "weak" },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
          <p className="text-lg text-black">Celebrating your achievement...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <p className="mb-4 text-lg text-black">Session not found</p>
          <button
            onClick={handleDashboard}
            className="rounded-lg bg-black px-6 py-2 text-white hover:bg-black/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { sessionComplete } = data;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto"
      >
        {/* Celebration Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-8xl mb-4"
          >
            🎉
          </motion.div>

          <h1 className="mb-2 text-5xl font-semibold text-black">Session Complete</h1>
          <p className="text-xl text-gray-500">
            Great work. You’re making progress towards your goals.
          </p>
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-none"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-3xl font-semibold text-black">
                {sessionComplete.duration}m
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Items Done</p>
              <p className="text-3xl font-semibold text-black">
                {sessionComplete.itemsReviewed}/{sessionComplete.totalItems}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Confidence</p>
              <p className="text-3xl font-semibold text-black">
                {sessionComplete.avgConfidence}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Mastery Gain</p>
              <p className="text-3xl font-semibold text-black">
                +{sessionComplete.masteryDelta}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Streak</p>
              <p className="text-3xl font-semibold text-black">+1</p>
            </div>
          </div>
        </motion.div>

        {/* Item Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-none"
        >
          <h3 className="mb-6 text-2xl font-semibold text-black">Items Reviewed</h3>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Topic</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Your Rating</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-500">Next Review</th>
              </tr>
            </thead>
            <tbody>
              {sessionComplete.itemBreakdown.map((item, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-4 font-medium text-black">{item.topic}</td>
                  <td className="py-4 px-4">
                    <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-black">
                      {item.subject}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-black">{item.rating}</td>
                  <td className="px-4 py-4 text-gray-500">{item.nextReview}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Weak Items Alert */}
        {sessionComplete.weakItems > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 rounded-2xl border border-gray-200 bg-gray-100 p-6"
          >
            <p className="mb-2 font-semibold text-black">
              {sessionComplete.weakItems} item(s) need more review
            </p>
            <p className="text-sm text-gray-600">
              Items you rated as "Again" or "Hard" have been marked for priority review.
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <button
            onClick={handleStartAnother}
            className="rounded-lg bg-black py-4 font-semibold text-white transition-colors hover:bg-black/90"
          >
            Start Another Session
          </button>

          {sessionComplete.weakItems > 0 && (
            <button
              onClick={handleReviewWeak}
              className="rounded-lg bg-gray-800 py-4 font-semibold text-white transition-colors hover:bg-black"
            >
              Review Weak Items
            </button>
          )}

          <button
            onClick={handleDashboard}
            className="rounded-lg border border-gray-200 bg-white py-4 font-semibold text-black transition-colors hover:bg-gray-100"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function getRatingLabel(rating?: number) {
  return {
    1: "Again ❌",
    2: "Hard 😐",
    3: "Good 🙂",
    4: "Easy 😄",
  }[rating || 0] || "Unrated";
}

function formatDate(date: Date) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }

  const daysFromNow = Math.floor(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysFromNow <= 7) {
    return `in ${daysFromNow} days`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
