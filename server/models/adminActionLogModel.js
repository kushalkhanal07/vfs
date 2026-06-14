import { model, Schema } from "mongoose";

const adminActionLogSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

adminActionLogSchema.index({ adminId: 1, createdAt: -1 });
adminActionLogSchema.index({ entityType: 1, createdAt: -1 });

const AdminActionLog = model("AdminActionLog", adminActionLogSchema);

export default AdminActionLog;
