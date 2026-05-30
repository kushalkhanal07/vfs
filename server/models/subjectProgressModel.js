import { model, Schema } from "mongoose";

const subjectProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    successfulReviews: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    mastery: { type: Number, default: 0 }, // 0-100
  },
  { timestamps: true }
);

subjectProgressSchema.index({ userId: 1, subject: 1 }, { unique: true });

const SubjectProgress = model("SubjectProgress", subjectProgressSchema);

export default SubjectProgress;
