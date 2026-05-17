import { Router } from "express";
import {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  archiveNote,
  generateShareLink,
  revokeShareLink,
} from "../controllers/note.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/", createNote);
router.get("/", getNotes);
router.get("/:noteId", getNoteById);
router.patch("/:noteId", updateNote);
router.delete("/:noteId", deleteNote);
router.patch("/:noteId/archive", archiveNote);
router.post("/:noteId/share", generateShareLink);
router.delete("/:noteId/share", revokeShareLink);

export default router;
