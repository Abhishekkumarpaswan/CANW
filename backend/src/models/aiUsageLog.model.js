import mongoose from "mongoose";

const aiUsageLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },
    type: {
      type: String,
      enum: ["summary", "action_items", "suggested_title"],
      required: true,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

aiUsageLogSchema.index({ user: 1, createdAt: -1 });

export const AiUsageLog = mongoose.model("AiUsageLog", aiUsageLogSchema);
