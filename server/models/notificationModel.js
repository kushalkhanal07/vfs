import { model, Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "revision_reminder",
        "session_reminder",
        "session_starting",
        "missed_revision",
        "study_streak",
        "deadline_reminder",
        "upload_success",
        "learning_recommendation",
        "system",
      ],
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    actionUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = model("Notification", notificationSchema);

export default Notification;
