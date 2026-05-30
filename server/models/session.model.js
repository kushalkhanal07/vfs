import { model, Schema } from "mongoose";

const sessionReminderSchema = new Schema(
  {
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
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    reminderInterval: {
      type: Number,
      required: true,
      min: 1,
      default: 10,
    },
    status: {
      type: String,
      enum: ["scheduled", "started", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sentReminderMinutes: {
      type: [Number],
      default: [],
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

sessionReminderSchema.index({ status: 1, startTime: 1 });
sessionReminderSchema.index({ createdBy: 1, startTime: 1 });

const Session = model("SessionReminder", sessionReminderSchema);

export default Session;