import AnalyticsService from "../services/analyticsService.js";

export const getSubjectMastery = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const data = await AnalyticsService.getSubjectMastery(userId);
    res.json({ subjects: data });
  } catch (err) {
    next(err);
  }
};

export const getActivityHeatmap = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 84; // last 12 weeks default
    const data = await AnalyticsService.getActivityHeatmap(userId, days);
    res.json({ data });
  } catch (err) {
    next(err);
  }
};
