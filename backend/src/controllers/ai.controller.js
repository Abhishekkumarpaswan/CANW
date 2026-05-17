import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Note } from "../models/note.model.js";
import axios from "axios";
import { AiUsageLog } from "../models/aiUsageLog.model.js";

const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:8000";

const generateSummary = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: noteId, owner: userId });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  if (!note.content) {
    throw new ApiError(400, "Note content is empty");
  }

  try {
    const response = await axios.post(`${AI_SERVER_URL}/api/ai/summarize`, {
      content: note.content,
      title: note.title,
    });

    const { summary, actionItems, suggestedTitle } = response.data;

    note.summary = summary;
    note.actionItems = actionItems || [];
    note.suggestedTitle = suggestedTitle;
    await note.save();

    await AiUsageLog.create({
      user: userId,
      note: noteId,
      type: "summary",
      tokensUsed: response.data.tokensUsed || 0,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { summary, actionItems, suggestedTitle },
          "Summary generated successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to generate summary");
  }
});

export { generateSummary };
