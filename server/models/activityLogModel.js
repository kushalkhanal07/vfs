import { model, Schema } from "mongoose";

const activityLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    activityType: {
      type: String,
      required: true,
      enum: [
        "note_create",
        "file_upload",
        "revision_complete",
        "revision_session_create",
        "revision_session_complete",
        "study_session_create",
        "study_session_start",
        "dashboard_activity",
      ],
    },
    activityCount: { type: Number, default: 1 },
    duration: { type: Number, default: 0 }, // seconds or minutes depending on context
    subject: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, createdAt: 1 });

const ActivityLog = model("ActivityLog", activityLogSchema);

export default ActivityLog;
