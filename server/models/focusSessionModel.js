import { model, Schema } from "mongoose";

const focusSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subjects: [
      {
        type: String,
        trim: true,
      },
    ],
    mode: {
      type: String,
      enum: ["revision", "free-study", "mixed"],
      default: "revision",
    },
    status: {
      type: String,
      enum: ["setup", "active", "paused", "complete"],
      default: "setup",
    },
    duration: {
      type: Number, // in minutes
      default: 25,
    },
    plannedDuration: {
      type: Number, // original planned duration
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    pausedAt: {
      type: Date,
    },
    totalPausedTime: {
      type: Number,
      default: 0, // in milliseconds
    },
    items: [
      {
        noteId: {
          type: Schema.Types.ObjectId,
          ref: "Note",
        },
        order: Number,
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed"],
          default: "pending",
        },
        rating: {
          type: Number, // 1-4 (Again/Hard/Good/Easy)
          min: 1,
          max: 4,
        },
        timeSpent: Number, // in seconds
        ratedAt: Date,
        notTitle: String, // cached for easy display
        noteSubject: String, // cached
      },
    ],
    stats: {
      itemsReviewed: {
        type: Number,
        default: 0,
      },
      itemsCount: {
        type: Number,
        default: 0,
      },
      avgConfidence: {
        type: Number, // 0-100
        default: 0,
      },
      masteryDelta: {
        type: Number, // change in mastery %
        default: 0,
      },
      totalTimeSpent: Number, // in seconds
    },
    streakData: {
      previousStreak: Number,
      newStreak: Number,
      streakIncremented: Boolean,
    },
    nextReviewDates: {
      type: Map,
      of: Date,
    },
    weakItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "Note",
      },
    ],
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

// Index for finding recent sessions
focusSessionSchema.index({ userId: 1, createdAt: -1 });
focusSessionSchema.index({ userId: 1, status: 1 });

const FocusSession = model("FocusSession", focusSessionSchema);

export default FocusSession;
