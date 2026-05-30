import { model, Schema } from "mongoose";

const revisionScheduleSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["note", "file", "folder"],
      required: true,
    },
    nextReviewDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    // SM-2 Algorithm fields
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    repetitionCount: {
      type: Number,
      default: 0,
    },
    interval: {
      type: Number,
      default: 1, // in days
    },
    difficulty: {
      type: Number,
      default: 0,
    },
    lastReviewDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    dueToday: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

revisionScheduleSchema.index({ userId: 1, nextReviewDate: 1 });
revisionScheduleSchema.index({ userId: 1, isActive: 1, dueToday: 1 });
revisionScheduleSchema.index({ userId: 1, priority: 1 });

const RevisionSchedule = model("RevisionSchedule", revisionScheduleSchema);

export default RevisionSchedule;
