import { Router } from "express";
import { getDashboardInsights } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getDashboardInsights);

export default router;
