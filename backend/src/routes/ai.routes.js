import { Router } from "express";
import { generateSummary } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/:noteId/summarize", generateSummary);

export default router;
