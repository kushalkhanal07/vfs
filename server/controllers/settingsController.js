import Settings from "../models/settingsModel.js";

export const getSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let settings = await Settings.findOne({ userId }).lean();
    if (!settings) {
      // return sensible defaults
      settings = {
        theme: "light",
        accent: "Indigo",
        preferences: { dailyRevisionReminders: true, aiScheduling: true, weeklyDigest: false },
        language: "en",
      };
    }
    res.json({ settings });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const payload = req.body || {};

    const update = {
      theme: payload.theme,
      accent: payload.accent,
      preferences: payload.preferences,
      language: payload.language,
    };

    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
    const updated = await Settings.findOneAndUpdate({ userId }, { $set: update }, opts).lean();
    res.json({ settings: updated });
  } catch (err) {
    next(err);
  }
};
