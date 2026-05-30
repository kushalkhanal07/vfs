import { model, Schema } from "mongoose";

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
      default: null,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    lastEditedAt: {
      type: Date,
      default: Date.now,
    },
    contentHash: {
      type: String,
      sparse: true,
    },
    spamScore: {
      type: Number,
      default: 0,
    },
    isSpamFlagged: {
      type: Boolean,
      default: false,
    },
    spamReasons: {
      type: [String],
      default: [],
    },
    cspaScore: {
      type: Number,
      default: 0,
    },
    isDuplicateFlagged: {
      type: Boolean,
      default: false,
    },
    isRelatedFlagged: {
      type: Boolean,
      default: false,
    },
    cspaReasons: {
      type: [String],
      default: [],
    },
    shieldScore: {
      type: Number,
      default: 0,
    },
    shieldAction: {
      type: String,
      default: "SAFE",
    },
    shieldFlags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

// Index for faster queries
noteSchema.index({ userId: 1, isArchived: 1, deleted: 1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ userId: 1, folderId: 1 });
noteSchema.index({ userId: 1, lastEditedAt: -1 });
noteSchema.index({ content: "text", title: "text", tags: "text" });

const Note = model("Note", noteSchema);

export default Note;
