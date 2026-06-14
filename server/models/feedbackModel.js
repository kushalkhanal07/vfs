import { model, Schema } from "mongoose";

const feedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Bug", "Feature", "Support", "Billing", "Other"],
      default: "Other",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    adminReply: {
      type: String,
      default: "",
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ email: 1, createdAt: -1 });

const Feedback = model("Feedback", feedbackSchema);

export default Feedback;
