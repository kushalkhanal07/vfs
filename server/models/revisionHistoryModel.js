import { model, Schema } from "mongoose";

const revisionHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    revisionScheduleId: {
      type: Schema.Types.ObjectId,
      ref: "RevisionSchedule",
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
    reviewScore: {
      type: Number,
      min: 0,
      max: 5,
      required: true,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
    reviewDate: {
      type: Date,
      default: Date.now,
    },
    // SM-2 values after this review
    nextEaseFactor: {
      type: Number,
      default: 2.5,
    },
    nextInterval: {
      type: Number,
      default: 1,
    },
    nextRepetitionCount: {
      type: Number,
      default: 1,
    },
  },
  {
    strict: "throw",
  }
);

revisionHistorySchema.index({ userId: 1, reviewDate: -1 });
revisionHistorySchema.index({ userId: 1, contentType: 1 });

const RevisionHistory = model("RevisionHistory", revisionHistorySchema);

export default RevisionHistory;
