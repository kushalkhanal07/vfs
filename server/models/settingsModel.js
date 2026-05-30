import { model, Schema } from "mongoose";

const settingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
    accent: { type: String, default: "Indigo" },
    preferences: {
      dailyRevisionReminders: { type: Boolean, default: true },
      aiScheduling: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },
    language: { type: String, default: "en" },
  },
  { timestamps: true }
);

const Settings = model("Settings", settingsSchema);

export default Settings;
