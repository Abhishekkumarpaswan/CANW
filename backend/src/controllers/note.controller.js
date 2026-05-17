import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Note } from "../models/note.model.js";
import axios from "axios";
import crypto from "crypto";

const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags, category } = req.body;
  const userId = req.user._id;

  if (!title?.trim()) {
    throw new ApiError(400, "Title is required");
  }

  const note = await Note.create({
    title: title.trim(),
    content: content || "",
    owner: userId,
    tags: tags || [],
    category: category || "personal",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, note, "Note created successfully"));
});

const getNotes = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { search, tag, category, sortBy = "recent", archived = "active" } =
    req.query;

  let filter = { owner: userId };

  if (archived === "archived") {
    filter.isArchived = true;
  } else if (archived !== "all") {
    filter.isArchived = false;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  if (tag) {
    filter.tags = tag;
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  let sortOrder = { updatedAt: -1 };
  if (sortBy === "oldest") {
    sortOrder = { updatedAt: 1 };
  } else if (sortBy === "title") {
    sortOrder = { title: 1 };
  }

  const notes = await Note.find(filter).sort(sortOrder).select("-shareToken");

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: noteId, owner: userId });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note fetched successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { title, content, tags, category } = req.body;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: noteId, owner: userId });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  if (title !== undefined) {
    if (!title.trim()) {
      throw new ApiError(400, "Title is required");
    }
    note.title = title.trim();
  }

  if (content !== undefined) note.content = content;
  if (tags !== undefined) note.tags = tags;
  if (category !== undefined) note.category = category;

  await note.save();

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user._id;

  const note = await Note.findOneAndDelete({ _id: noteId, owner: userId });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note deleted successfully"));
});

const archiveNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user._id;
  const { isArchived } = req.body;

  const note = await Note.findOne({ _id: noteId, owner: userId });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  note.isArchived = isArchived;
  await note.save();

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note archive status updated"));
});

const generateShareLink = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: noteId, owner: userId });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  if (!note.shareToken) {
    note.shareToken = crypto.randomBytes(16).toString("hex");
  }

  note.isPublic = true;
  await note.save();

  const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/share/${note.shareToken}`;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { shareUrl, shareToken: note.shareToken },
        "Share link generated",
      ),
    );
});

const revokeShareLink = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const userId = req.user._id;

  const note = await Note.findOne({ _id: noteId, owner: userId });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  note.isPublic = false;
  note.shareToken = undefined;
  await note.save();

  return res.status(200).json(new ApiResponse(200, {}, "Share link revoked"));
});

export {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  archiveNote,
  generateShareLink,
  revokeShareLink,
};
