import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      enum: ["work", "personal", "study", "ideas", "other"],
      default: "personal",
    },
    summary: {
      type: String,
      default: null,
    },
    actionItems: [String],
    suggestedTitle: {
      type: String,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true },
);

noteSchema.index({ title: "text", content: "text" });
noteSchema.index({ owner: 1, isArchived: 1 });
noteSchema.index({ shareToken: 1 });

export const Note = mongoose.model("Note", noteSchema);
