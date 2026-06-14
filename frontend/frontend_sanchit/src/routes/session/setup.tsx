import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export const Route = createFileRoute("/session/setup")({
  component: SessionSetup,
});

function SessionSetup() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [duration, setDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState("");
  const [mode, setMode] = useState<"revision" | "free-study" | "mixed">("revision");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);

  // In a real app, fetch user's actual subjects from API
  const availableSubjects = ["Biology", "Physics", "Chemistry", "Mathematics", "History", "Literature"];

  const handleSubjectToggle = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleDurationChange = (value: number) => {
    if (value === 0) {
      setShowCustom(true);
      setDuration(25);
    } else {
      setShowCustom(false);
      setDuration(value);
    }
  };

  const handleStartSession = async () => {
    if (subjects.length === 0) {
      setError("Please select at least one subject");
      return;
    }

    const finalDuration = showCustom ? parseInt(customDuration) || 25 : duration;

    if (finalDuration < 1 || finalDuration > 480) {
      setError("Duration must be between 1 and 480 minutes");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE}/api/sessions/create`,
        {
          subjects,
          duration: finalDuration,
          mode,
        },
        { withCredentials: true }
      );

      // Store session ID in localStorage for restoration on refresh
      localStorage.setItem("currentSessionId", response.data.sessionId);

      navigate({
        to: `/session/${response.data.sessionId}/active`,
      } as any);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-semibold text-black">Start Your Focus Session</h1>
          <p className="text-gray-500">Organize your revision and stay focused</p>
        </div>

        {/* Setup Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-none">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg border border-gray-200 bg-gray-100 p-4 text-black"
            >
              {error}
            </motion.div>
          )}

          {/* 1. Select Subjects */}
          <div className="mb-8">
            <label className="mb-4 block text-lg font-semibold text-black">
              What do you want to study today?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableSubjects.map((subject) => (
                <motion.button
                  key={subject}
                  onClick={() => handleSubjectToggle(subject)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    subjects.includes(subject)
                      ? "bg-black text-white"
                      : "border border-gray-200 bg-white text-black hover:bg-gray-100"
                  }`}
                >
                    {subjects.includes(subject) ? "✓ " : ""}{subject}
                </motion.button>
              ))}
            </div>
          </div>

          {/* 2. Session Duration */}
          <div className="mb-8">
            <label className="mb-4 block text-lg font-semibold text-black">
              Session Duration
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[25, 45, 60].map((min) => (
                <motion.button
                  key={min}
                  onClick={() => handleDurationChange(min)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    duration === min && !showCustom
                      ? "bg-black text-white"
                      : "border border-gray-200 bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {min} min
                </motion.button>
              ))}
              <motion.button
                onClick={() => handleDurationChange(0)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-lg font-medium transition-all ${
                  showCustom
                    ? "bg-black text-white"
                    : "border border-gray-200 bg-white text-black hover:bg-gray-100"
                }`}
              >
                Custom
              </motion.button>
            </div>

            {showCustom && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="Enter minutes (1-480)"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </motion.div>
            )}
          </div>

          {/* 3. Session Mode */}
          <div className="mb-8">
            <label className="mb-4 block text-lg font-semibold text-black">
              Session Mode
            </label>
            <div className="space-y-3">
              {[
                { id: "revision", label: "Revision Mode", desc: "Use your revision queue" },
                {
                  id: "free-study",
                  label: "Free Study Mode",
                  desc: "Pick topics freely",
                },
                { id: "mixed", label: "Mixed Mode", desc: "Revision + new material" },
              ].map(({ id, label, desc }) => (
                <motion.label
                  key={id}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center p-4 rounded-lg cursor-pointer border-2 transition-all ${
                    mode === id
                      ? "border-black bg-gray-100"
                      : "border-gray-200 bg-white hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={id}
                    checked={mode === id}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="h-4 w-4 cursor-pointer text-black"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-black">{label}</div>
                    <div className="text-sm text-gray-500">{desc}</div>
                  </div>
                </motion.label>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            onClick={handleStartSession}
            disabled={loading || subjects.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-lg bg-black py-4 font-semibold text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Starting Session..." : "Start Focus Session"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
