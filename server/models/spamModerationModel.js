import { model, Schema } from "mongoose";

const spamModerationSchema = new Schema(
  {
    itemType: {
      type: String,
      enum: ["file", "note"],
      required: true,
    },
    itemId: {
      type: Schema.Types.Mixed,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      default: "",
      trim: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    spamScore: {
      type: Number,
      required: true,
      min: 0,
    },
    reasons: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["blocked", "reviewed", "false_positive", "allowed"],
      default: "blocked",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

spamModerationSchema.index({ itemType: 1, status: 1, createdAt: -1 });
spamModerationSchema.index({ userId: 1, createdAt: -1 });

const SpamModeration = model("SpamModeration", spamModerationSchema);

export default SpamModeration;
