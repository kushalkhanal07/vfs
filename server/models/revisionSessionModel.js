import { model, Schema } from "mongoose";

const revisionSessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    revisionDate: {
      type: Date,
      required: true,
    },
    revisionTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 5,
      default: 30,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    difficulty: {
      type: String,
      trim: true,
      default: "Medium",
    },
    tags: {
      type: [String],
      default: [],
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderInterval: {
      // minutes before the session to trigger reminder
      type: Number,
      default: 10,
      min: 1,
    },
    sentReminder: {
      type: Boolean,
      default: false,
    },
    examBoost: {
      type: Boolean,
      default: false,
    },
    // Optional exam date: used by the revision priority score (exam urgency)
    examDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);

revisionSessionSchema.index({ user: 1, revisionDate: 1, revisionTime: 1 });
revisionSessionSchema.index({ user: 1, status: 1 });

const RevisionSession = model("RevisionSession", revisionSessionSchema);

export default RevisionSession;
