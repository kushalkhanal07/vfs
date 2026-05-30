import { model, Schema } from "mongoose";

const studySessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    contentId: { type: Schema.Types.ObjectId, required: false },
    contentType: { type: String, enum: ["note", "file", "folder"], required: false },
    startDate: { type: Date, required: true },
    durationMinutes: { type: Number, default: 30 },
    tags: { type: [String], default: [] },
    notes: { type: String, default: "" },
    isCancelled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

studySessionSchema.index({ userId: 1, startDate: 1 });

const StudySession = model("StudySession", studySessionSchema);

export default StudySession;
