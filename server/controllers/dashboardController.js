/**
 * Dashboard Controller - Dashboard aggregations
 */

import { DashboardService } from "../services/dashboardService.js";

// GET DASHBOARD OVERVIEW
export const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const overview = await DashboardService.getDashboardOverview(userId);
    res.json(overview);
  } catch (err) {
    next(err);
  }
};

// GET RECENT NOTES
export const getRecentNotes = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    const notes = await DashboardService.getRecentNotes(userId, limit);
    res.json({ notes });
  } catch (err) {
    next(err);
  }
};

// GET RECENT FILES
export const getRecentFiles = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    const files = await DashboardService.getRecentFiles(userId, limit);
    res.json({ files });
  } catch (err) {
    next(err);
  }
};

// GET REVISION SUMMARY
export const getRevisionSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const summary = await DashboardService.getRevisionSummary(userId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

// GET ACTIVITY SUMMARY
export const getActivitySummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const activity = await DashboardService.getActivitySummary(userId);
    res.json(activity);
  } catch (err) {
    next(err);
  }
};

// GET STUDY STREAK
export const getStudyStreak = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const streak = await DashboardService.getStudyStreak(userId);
    res.json(streak);
  } catch (err) {
    next(err);
  }
};

// GET LEARNING RECOMMENDATIONS
export const getLearningRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const recommendations = await DashboardService.getLearningRecommendations(userId);
    res.json(recommendations);
  } catch (err) {
    next(err);
  }
};

// GET COMPLETE DASHBOARD STATS
export const getCompleteStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [overview, streak, activity, recommendations] = await Promise.all([
      DashboardService.getDashboardOverview(userId),
      DashboardService.getStudyStreak(userId),
      DashboardService.getActivitySummary(userId),
      DashboardService.getLearningRecommendations(userId),
    ]);

    res.json({
      overview,
      streak,
      activity,
      recommendations,
    });
  } catch (err) {
    next(err);
  }
};

// GET QUICK METRICS (for dashboard cards)
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const metrics = await DashboardService.getQuickMetrics(userId);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
};
