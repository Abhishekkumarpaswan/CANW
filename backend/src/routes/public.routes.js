import { Router } from "express";
import { Note } from "../models/note.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

router.get("/:shareToken", async (req, res) => {
  try {
    const { shareToken } = req.params;

    const note = await Note.findOne({
      shareToken,
      isPublic: true,
    }).select("-owner -shareToken");

    if (!note) {
      throw new ApiError(404, "Shared note not found or has been revoked");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, note, "Shared note fetched successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.message || "Failed to fetch shared note",
        ),
      );
  }
});

export default router;
