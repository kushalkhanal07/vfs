import { model, Schema } from "mongoose";

const adminSettingsSchema = new Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "global",
    },
    uploadSizeLimit: {
      type: Number,
      default: 5242880,
    },
    allowedFileTypes: {
      type: [String],
      default: ["pdf", "docx", "pptx", "png", "jpg", "jpeg", "txt"],
    },
    spamThreshold: {
      type: Number,
      default: 0.15,
      min: 0,
      max: 1,
    },
    revisionSettings: {
      defaultIntervalDays: {
        type: Number,
        default: 1,
      },
      reminderLeadMinutes: {
        type: Number,
        default: 10,
      },
      streakGraceDays: {
        type: Number,
        default: 1,
      },
    },
    notificationSettings: {
      dailyDigestEnabled: {
        type: Boolean,
        default: true,
      },
      broadcastEnabled: {
        type: Boolean,
        default: true,
      },
    },
    storageLimitBytes: {
      type: Number,
      default: 5242880,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

const AdminSettings = model("AdminSettings", adminSettingsSchema);

export default AdminSettings;
