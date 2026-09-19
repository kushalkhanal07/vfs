import RevisionSession from "../models/revisionSessionModel.js";
import AnalyticsService from "./analyticsService.js";
import { buildScheduledAt, startOfDay } from "./revisionSessionService.js";

/*
 * REVISION PRIORITY SCORE ALGORITHM
 * Decides which subject should be revised first.
 *
 *   Priority = (0.35 x D) + (0.30 x R) + (0.20 x E) + (0.15 x H)      -> shown as 0-100
 *
 *   D = days since last revision / 30   (capped at 1, never revised = 1)
 *   R = weakness = 1 - recall / 5       (recall = Subject Mastery % turned into 0-5)
 *   E = exam urgency = 1 - examDays / 30 if the exam is within 30 days, else 0
 *   H = difficulty / 5                  (Easy 1, Medium 3, Hard 4, Very Hard 5)
 *
 *   score >= 70 -> High,  score >= 40 -> Medium,  otherwise Low
 */

const DAY_MS = 24 * 60 * 60 * 1000;

const DIFFICULTY_SCORES = {
  easy: 1,
  medium: 3,
  hard: 4,
  "very hard": 5,
};

export function calculatePriority(days, recall, examDays, difficulty) {
  const d = days === null ? 1 : Math.min(days / 30, 1);
  const r = 1 - recall / 5;
  const e = examDays !== null && examDays <= 30 ? 1 - examDays / 30 : 0;
  const h = difficulty / 5;

  const score = d * 0.35 + r * 0.3 + e * 0.2 + h * 0.15;

  return Math.round(score * 100);
}

export function getPriorityLevel(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function getDifficultyScore(difficulty) {
  const key = String(difficulty || "").trim().toLowerCase();
  return DIFFICULTY_SCORES[key] ?? DIFFICULTY_SCORES.medium;
}

// Collect the facts the formula needs for every subject of the user
export async function getSubjectPriorities(userId) {
  const now = new Date();
  const today = startOfDay(now);

  const [sessions, masteryRows] = await Promise.all([
    RevisionSession.find({ user: userId, status: { $ne: "cancelled" } }).lean(),
    AnalyticsService.getSubjectMastery(userId),
  ]);

  const masteryBySubject = new Map();
  for (const row of masteryRows) {
    masteryBySubject.set(String(row.subject).trim().toLowerCase(), row.mastery);
  }

  const subjects = new Map();

  for (const session of sessions) {
    const name = String(session.subject || "General").trim();
    const key = name.toLowerCase();

    if (!subjects.has(key)) {
      subjects.set(key, { subject: name, lastRevision: null, nearestExam: null, difficulty: 0 });
    }
    const item = subjects.get(key);

    // A session counts as a revision once its time has passed (or it is marked completed)
    const sessionTime = buildScheduledAt(session) || new Date(session.revisionDate);
    const isRevised = session.status === "completed" || sessionTime <= now;
    if (isRevised && (!item.lastRevision || sessionTime > item.lastRevision)) {
      item.lastRevision = sessionTime;
    }

    // Nearest exam that has not happened yet
    if (session.examDate) {
      const examDay = startOfDay(session.examDate);
      if (examDay >= today && (!item.nearestExam || examDay < item.nearestExam)) {
        item.nearestExam = examDay;
      }
    }

    // Hardest difficulty chosen for this subject
    item.difficulty = Math.max(item.difficulty, getDifficultyScore(session.difficulty));
  }

  const ranked = [];

  for (const [key, item] of subjects) {
    const daysSinceLastRevision = item.lastRevision
      ? Math.floor((now.getTime() - item.lastRevision.getTime()) / DAY_MS)
      : null;
    const recallScore = masteryBySubject.has(key) ? (masteryBySubject.get(key) / 100) * 5 : null;
    const examDaysLeft = item.nearestExam
      ? Math.round((item.nearestExam.getTime() - today.getTime()) / DAY_MS)
      : null;

    const score = calculatePriority(daysSinceLastRevision, recallScore ?? 0, examDaysLeft, item.difficulty);

    ranked.push({
      subject: item.subject,
      score,
      level: getPriorityLevel(score),
      factors: {
        daysSinceLastRevision,
        recallScore: recallScore === null ? null : Math.round(recallScore * 10) / 10,
        examDaysLeft,
        difficulty: item.difficulty,
      },
    });
  }

  // Highest score first = revise first
  ranked.sort((left, right) => right.score - left.score || left.subject.localeCompare(right.subject));

  return ranked;
}
