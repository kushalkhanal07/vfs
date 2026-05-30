import { model, Schema } from "mongoose";

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    starred: {
      type: Boolean,
      default: false,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    size: {
      type: Number,
      default: 0,
    },
    fileHash: {
      type: String,
      index: true,
      sparse: true,
    },
    originalName: {
      type: String,
    },
    mimeType: {
      type: String,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

const File = model("File", fileSchema);
export default File;
